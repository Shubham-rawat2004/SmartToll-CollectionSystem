package com.smarttoll.system.controller;

import com.smarttoll.system.dto.TollProcessRequest;
import com.smarttoll.system.dto.TollProcessResponse;
import com.smarttoll.system.service.TollService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/toll")
public class TollController {

    private static final Logger logger = LoggerFactory.getLogger(TollController.class);

    private final TollService tollService;

    public TollController(TollService tollService) {
        this.tollService = tollService;
    }

    @PostMapping("/scan")
    public ResponseEntity<TollProcessResponse> scanRfid(@RequestBody TollProcessRequest request) {
        logger.info("Received scan request for RFID tag {} at booth {}", request.getRfidTag(), request.getTollBoothId());
        TollProcessResponse response = tollService.processToll(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}
