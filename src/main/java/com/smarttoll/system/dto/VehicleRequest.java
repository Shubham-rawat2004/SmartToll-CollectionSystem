package com.smarttoll.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    private String vehicleNumber;
    private Long ownerId;
    private String rfidTag;
}
