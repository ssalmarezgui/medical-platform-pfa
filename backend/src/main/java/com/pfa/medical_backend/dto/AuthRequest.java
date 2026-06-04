package com.pfa.medical_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Le login est obligatoire")
    private String loginU;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motPasseU;
}