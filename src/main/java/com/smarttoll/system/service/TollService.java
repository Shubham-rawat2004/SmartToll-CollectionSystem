package com.smarttoll.system.service;

import com.smarttoll.system.dto.TollProcessRequest;
import com.smarttoll.system.dto.TollProcessResponse;
import com.smarttoll.system.exception.InsufficientBalanceException;
import com.smarttoll.system.exception.FraudDetectionException;
import com.smarttoll.system.exception.VehicleNotFoundException;
import com.smarttoll.system.entity.TollBooth;
import com.smarttoll.system.entity.Transaction;
import com.smarttoll.system.entity.TransactionStatus;
import com.smarttoll.system.entity.User;
import com.smarttoll.system.entity.Vehicle;
import com.smarttoll.system.repository.TollBoothRepository;
import com.smarttoll.system.repository.TransactionRepository;
import com.smarttoll.system.repository.UserRepository;
import com.smarttoll.system.repository.VehicleRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TollService {

    private static final Logger logger = LoggerFactory.getLogger(TollService.class);
    private static final long DUPLICATE_SCAN_WINDOW_SECONDS = 60L;

    private final VehicleRepository vehicleRepository;
    private final TollBoothRepository tollBoothRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public TollService(
            VehicleRepository vehicleRepository,
            TollBoothRepository tollBoothRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository
    ) {
        this.vehicleRepository = vehicleRepository;
        this.tollBoothRepository = tollBoothRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public TollProcessResponse processToll(TollProcessRequest request) {
        LocalDateTime processedAt = LocalDateTime.now();
        logger.info(
                "Processing toll scan for RFID tag {} at booth {} / {}",
                request.getRfidTag(),
                request.getTollBoothId(),
                request.getTollBoothName()
        );

        Vehicle vehicle = resolveVehicleFromScanInput(request.getRfidTag());

        return processTollForVehicle(vehicle, request, processedAt);
    }

    @Transactional
    public TollProcessResponse processTollByVehicleNumber(TollProcessRequest request) {
        LocalDateTime processedAt = LocalDateTime.now();
        logger.info(
                "Processing toll scan for vehicle number {} at booth {} / {}",
                request.getVehicleNumber(),
                request.getTollBoothId(),
                request.getTollBoothName()
        );

        String normalizedVehicleNumber = normalizeValue(request.getVehicleNumber());
        Vehicle vehicle = vehicleRepository.findByVehicleNumber(normalizedVehicleNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found for the provided vehicle number"));

        return processTollForVehicle(vehicle, request, processedAt);
    }

    private Vehicle resolveVehicleFromScanInput(String scanInput) {
        String normalizedScanInput = normalizeValue(scanInput);

        return vehicleRepository.findByRfidTag(normalizedScanInput)
                .or(() -> vehicleRepository.findByVehicleNumber(normalizedScanInput))
                .orElseThrow(() -> new VehicleNotFoundException(
                        "Vehicle not found for the provided RFID tag or vehicle number"
                ));
    }

    private String normalizeValue(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }

    private TollProcessResponse processTollForVehicle(
            Vehicle vehicle,
            TollProcessRequest request,
            LocalDateTime processedAt
    ) {

        TollBooth tollBooth = resolveTollBooth(request);
        if (tollBooth == null) {
            logger.warn(
                    "Toll booth {} / {} was not found for vehicle {}",
                    request.getTollBoothId(),
                    request.getTollBoothName(),
                    vehicle.getVehicleNumber()
            );
            return TollProcessResponse.builder()
                    .success(false)
                    .message("Toll booth not found")
                    .vehicleNumber(vehicle.getVehicleNumber())
                    .ownerName(vehicle.getOwner().getName())
                    .status(TransactionStatus.FAILED)
                    .timestamp(processedAt)
                    .build();
        }

        User owner = vehicle.getOwner();
        BigDecimal walletBalance = owner.getWalletBalance() != null ? owner.getWalletBalance() : BigDecimal.ZERO;
        BigDecimal tollAmount = tollBooth.getTollAmount();

        transactionRepository.findTopByVehicleIdAndTollBoothIdOrderByTimestampDesc(vehicle.getId(), tollBooth.getId())
                .filter(transaction ->
                        transaction.getTimestamp() != null
                                && transaction.getTimestamp().isAfter(processedAt.minusSeconds(DUPLICATE_SCAN_WINDOW_SECONDS)))
                .ifPresent(transaction -> {
                    logger.warn(
                            "Duplicate scan detected for vehicle {} at booth {} within {} seconds",
                            vehicle.getVehicleNumber(),
                            tollBooth.getName(),
                            DUPLICATE_SCAN_WINDOW_SECONDS
                    );

                    Transaction duplicateTransaction = Transaction.builder()
                            .vehicle(vehicle)
                            .tollBooth(tollBooth)
                            .amount(tollAmount)
                            .timestamp(processedAt)
                            .status(TransactionStatus.FAILED)
                            .build();
                    transactionRepository.save(duplicateTransaction);
                    throw new FraudDetectionException("Duplicate RFID scan detected within 1 minute");
                });

        if (walletBalance.compareTo(tollAmount) < 0) {
            Transaction failedTransaction = Transaction.builder()
                    .vehicle(vehicle)
                    .tollBooth(tollBooth)
                    .amount(tollAmount)
                    .timestamp(processedAt)
                    .status(TransactionStatus.FAILED)
                    .build();
            transactionRepository.save(failedTransaction);
            logger.warn(
                    "Insufficient balance for vehicle {}. Required: {}, Available: {}",
                    vehicle.getVehicleNumber(),
                    tollAmount,
                    walletBalance
            );
            throw new InsufficientBalanceException("Insufficient wallet balance");
        }

        BigDecimal remainingBalance = walletBalance.subtract(tollAmount);
        owner.setWalletBalance(remainingBalance);
        userRepository.save(owner);

        Transaction successfulTransaction = Transaction.builder()
                .vehicle(vehicle)
                .tollBooth(tollBooth)
                .amount(tollAmount)
                .timestamp(processedAt)
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(successfulTransaction);
        logger.info(
                "Toll processed successfully for vehicle {} at booth {}. Remaining balance: {}",
                vehicle.getVehicleNumber(),
                tollBooth.getName(),
                remainingBalance
        );

        return TollProcessResponse.builder()
                .success(true)
                .message("Toll deducted successfully")
                .vehicleNumber(vehicle.getVehicleNumber())
                .ownerName(owner.getName())
                .tollBoothName(tollBooth.getName())
                .tollAmount(tollAmount)
                .remainingBalance(remainingBalance)
                .status(TransactionStatus.SUCCESS)
                .timestamp(processedAt)
                .build();
    }

    private TollBooth resolveTollBooth(TollProcessRequest request) {
        if (request.getTollBoothName() != null && !request.getTollBoothName().isBlank()) {
            return tollBoothRepository.findByName(request.getTollBoothName().trim()).orElse(null);
        }

        if (request.getTollBoothId() != null) {
            return tollBoothRepository.findById(request.getTollBoothId()).orElse(null);
        }

        return null;
    }

    @Transactional(readOnly = true)
    public java.util.List<Transaction> getUserTransactionHistory(Long userId) {
        logger.info("Fetching transaction history for user {}", userId);
        return transactionRepository.findByVehicleOwnerIdOrderByTimestampDesc(userId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Transaction> getVehicleTransactionHistory(String vehicleNumber) {
        logger.info("Fetching transaction history for vehicle {}", vehicleNumber);
        return transactionRepository.findByVehicleVehicleNumberOrderByTimestampDesc(vehicleNumber);
    }
}
