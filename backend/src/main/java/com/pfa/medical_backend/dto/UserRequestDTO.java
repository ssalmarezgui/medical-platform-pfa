package com.pfa.medical_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserRequestDTO {

    @NotBlank(message="Le login est obligatoire")
    @Size(min = 4, max = 50, message = "Le login doit contenir entre 4 et 50 caractères")
    private String loginU;

    @NotBlank(message="Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motPasseU;
    @Pattern(regexp = "^(ADMIN|MEDECIN_INVESTIGATEUR|MEDECIN_SUIVI|AGENT_LABORATOIRE|AGENT_IMMUNO)$",
        message = "Le rôle fourni n'est pas valide pour cette plateforme"
    )
    private String roleU;

    private Integer serviceId;
    private Long medecinId;
}