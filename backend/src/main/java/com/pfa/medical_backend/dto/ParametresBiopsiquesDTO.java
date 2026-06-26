package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ParametresBiopsiquesDTO {
    private Integer identifiantPB;
    private LocalDate dateBiopsie;
    private String typeHistologique;
    private String scoreActivite;
    private String observations;
    private Integer nephropathieId; // Uniquement l'ID de liaison de la Néphropathie
}