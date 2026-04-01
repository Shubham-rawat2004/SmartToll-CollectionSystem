package com.smarttoll.system.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TollBoothResponse {

    private Long id;
    private String name;
    private String location;
    private BigDecimal tollAmount;
}
