package com.pfa.medical_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Le login est obligatoire")
    private String loginU;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motPasseU;
}