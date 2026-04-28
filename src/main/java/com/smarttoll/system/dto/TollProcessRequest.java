package com.smarttoll.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TollProcessRequest {

    private String rfidTag;
    private String vehicleNumber;
    private Long tollBoothId;
    private String tollBoothName;
}
