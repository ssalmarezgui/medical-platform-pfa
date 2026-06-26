package com.pfa.medical_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String loginU;
    private String role;

    public LoginResponse(String token, String loginU, String role) {
        this.token = token;
        this.loginU = loginU;
        this.role = role;
    }
}