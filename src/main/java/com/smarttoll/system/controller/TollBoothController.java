package com.smarttoll.system.controller;

import com.smarttoll.system.dto.TollBoothResponse;
import com.smarttoll.system.entity.TollBooth;
import com.smarttoll.system.repository.TollBoothRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/toll-booths")
public class TollBoothController {

    private final TollBoothRepository tollBoothRepository;

    public TollBoothController(TollBoothRepository tollBoothRepository) {
        this.tollBoothRepository = tollBoothRepository;
    }

    @GetMapping
    public ResponseEntity<List<TollBoothResponse>> getAllTollBooths() {
        List<TollBoothResponse> tollBooths = tollBoothRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(tollBooths);
    }

    private TollBoothResponse mapToResponse(TollBooth tollBooth) {
        return TollBoothResponse.builder()
                .id(tollBooth.getId())
                .name(tollBooth.getName())
                .location(tollBooth.getLocation())
                .tollAmount(tollBooth.getTollAmount())
                .build();
    }
}
