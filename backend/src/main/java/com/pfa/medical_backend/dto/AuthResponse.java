package com.pfa.medical_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";

    private Integer userId;
    private String loginU;
    private String roleU;
    
    private Integer serviceId;

    private List<ServiceDTO> services;
}