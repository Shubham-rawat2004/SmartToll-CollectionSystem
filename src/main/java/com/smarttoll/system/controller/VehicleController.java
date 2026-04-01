package com.smarttoll.system.controller;

import com.smarttoll.system.dto.VehicleRequest;
import com.smarttoll.system.dto.VehicleResponse;
import com.smarttoll.system.dto.TransactionResponse;
import com.smarttoll.system.entity.Transaction;
import com.smarttoll.system.entity.User;
import com.smarttoll.system.entity.Vehicle;
import com.smarttoll.system.exception.UserNotFoundException;
import com.smarttoll.system.exception.VehicleNotFoundException;
import com.smarttoll.system.repository.UserRepository;
import com.smarttoll.system.repository.VehicleRepository;
import com.smarttoll.system.service.TollService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final TollService tollService;

    public VehicleController(
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            TollService tollService
    ) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.tollService = tollService;
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> registerVehicle(@RequestBody VehicleRequest request) {
        if (vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).isPresent()) {
            throw new IllegalArgumentException("Vehicle number already exists");
        }
        if (vehicleRepository.findByRfidTag(request.getRfidTag()).isPresent()) {
            throw new IllegalArgumentException("RFID tag already exists");
        }

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + request.getOwnerId()));

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getVehicleNumber())
                .owner(owner)
                .rfidTag(request.getRfidTag())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        logger.info("Registered vehicle {} for owner {}", savedVehicle.getVehicleNumber(), owner.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToVehicleResponse(savedVehicle));
    }

    @GetMapping("/{vehicleNumber}")
    public ResponseEntity<VehicleResponse> getVehicleInfo(@PathVariable String vehicleNumber) {
        Vehicle vehicle = vehicleRepository.findByVehicleNumber(vehicleNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with number: " + vehicleNumber));
        logger.info("Fetched details for vehicle {}", vehicleNumber);
        return ResponseEntity.ok(mapToVehicleResponse(vehicle));
    }

    @GetMapping("/{vehicleNumber}/transactions")
    public ResponseEntity<List<TransactionResponse>> getVehicleTransactionHistory(@PathVariable String vehicleNumber) {
        vehicleRepository.findByVehicleNumber(vehicleNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with number: " + vehicleNumber));

        List<TransactionResponse> transactions = tollService.getVehicleTransactionHistory(vehicleNumber)
                .stream()
                .map(this::mapToTransactionResponse)
                .toList();
        logger.info("Fetched {} transactions for vehicle {}", transactions.size(), vehicleNumber);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        List<VehicleResponse> vehicles = vehicleRepository.findAll()
                .stream()
                .map(this::mapToVehicleResponse)
                .toList();
        logger.info("Fetched {} vehicles for monitoring", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    private VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .ownerId(vehicle.getOwner().getId())
                .ownerName(vehicle.getOwner().getName())
                .rfidTag(vehicle.getRfidTag())
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
