package com.smarttoll.system.dto;

import com.smarttoll.system.entity.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TollProcessResponse {

    private boolean success;
    private String message;
    private String vehicleNumber;
    private String ownerName;
    private String tollBoothName;
    private BigDecimal tollAmount;
    private BigDecimal remainingBalance;
    private TransactionStatus status;
    private LocalDateTime timestamp;
}
