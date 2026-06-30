package com.pfa.medical_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String loginU;
    private String role;
    private List<String> authorities;

    public LoginResponse(String token, String loginU, String role) {
        this.token = token;
        this.loginU = loginU;
        this.role = role;
    }

    public LoginResponse(String token, String loginU, String role, List<String> authorities) {
        this.token = token;
        this.loginU = loginU;
        this.role = role;
        this.authorities = authorities;
    }
}