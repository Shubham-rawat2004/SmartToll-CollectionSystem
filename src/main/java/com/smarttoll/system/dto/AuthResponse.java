package com.smarttoll.system.dto;

import com.smarttoll.system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String message;
    private Long userId;
    private String name;
    private String email;
    private Role role;
}
