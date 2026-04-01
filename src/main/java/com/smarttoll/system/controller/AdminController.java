package com.smarttoll.system.controller;

import com.smarttoll.system.dto.TollBoothRequest;
import com.smarttoll.system.dto.TollBoothResponse;
import com.smarttoll.system.dto.TransactionResponse;
import com.smarttoll.system.entity.TollBooth;
import com.smarttoll.system.entity.Transaction;
import com.smarttoll.system.repository.TollBoothRepository;
import com.smarttoll.system.repository.TransactionRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final TollBoothRepository tollBoothRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(
            TollBoothRepository tollBoothRepository,
            TransactionRepository transactionRepository
    ) {
        this.tollBoothRepository = tollBoothRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/toll-booths")
    public ResponseEntity<TollBoothResponse> addTollBooth(@RequestBody TollBoothRequest request) {
        TollBooth tollBooth = TollBooth.builder()
                .name(request.getName())
                .location(request.getLocation())
                .tollAmount(request.getTollAmount())
                .build();

        TollBooth savedTollBooth = tollBoothRepository.save(tollBooth);
        logger.info("Created toll booth {} at {}", savedTollBooth.getName(), savedTollBooth.getLocation());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToTollBoothResponse(savedTollBooth));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> viewAllTransactions() {
        List<TransactionResponse> responses = transactionRepository.findAll()
                .stream()
                .map(this::mapToTransactionResponse)
                .toList();
        logger.info("Fetched {} transactions for admin view", responses.size());
        return ResponseEntity.ok(responses);
    }

    private TollBoothResponse mapToTollBoothResponse(TollBooth tollBooth) {
        return TollBoothResponse.builder()
                .id(tollBooth.getId())
                .name(tollBooth.getName())
                .location(tollBooth.getLocation())
                .tollAmount(tollBooth.getTollAmount())
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
