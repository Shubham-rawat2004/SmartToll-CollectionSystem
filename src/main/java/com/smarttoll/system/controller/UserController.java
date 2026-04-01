package com.smarttoll.system.controller;

import com.smarttoll.system.dto.AddMoneyRequest;
import com.smarttoll.system.dto.TransactionResponse;
import com.smarttoll.system.dto.UserResponse;
import com.smarttoll.system.entity.Transaction;
import com.smarttoll.system.entity.User;
import com.smarttoll.system.exception.UserNotFoundException;
import com.smarttoll.system.repository.UserRepository;
import com.smarttoll.system.service.TollService;
import java.math.BigDecimal;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final TollService tollService;

    public UserController(UserRepository userRepository, TollService tollService) {
        this.userRepository = userRepository;
        this.tollService = tollService;
    }

    @PatchMapping("/{id}/wallet")
    public ResponseEntity<UserResponse> addMoneyToWallet(
            @PathVariable Long id,
            @RequestBody AddMoneyRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        user.setWalletBalance(currentBalance.add(amount));
        User updatedUser = userRepository.save(user);
        logger.info("Added {} to wallet for user {}", amount, id);

        return ResponseEntity.status(HttpStatus.OK).body(mapToUserResponse(updatedUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        logger.info("Fetched details for user {}", id);
        return ResponseEntity.ok(mapToUserResponse(user));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> getUserTransactionHistory(@PathVariable Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        List<TransactionResponse> transactions = tollService.getUserTransactionHistory(id)
                .stream()
                .map(this::mapToTransactionResponse)
                .toList();
        logger.info("Fetched {} transactions for user {}", transactions.size(), id);
        return ResponseEntity.ok(transactions);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .walletBalance(user.getWalletBalance())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .vehicleNumber(transaction.getVehicle().getVehicleNumber())
                .tollBoothName(transaction.getTollBooth().getName())
                .amount(transaction.getAmount())
                .timestamp(transaction.getTimestamp())
                .status(transaction.getStatus())
                .build();
    }
}
