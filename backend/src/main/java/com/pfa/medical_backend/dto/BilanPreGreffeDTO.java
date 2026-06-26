package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BilanPreGreffeDTO {
    private Integer identifiantB;
    private LocalDate dateBilanB;
    private String descriptionBilanB;
    private String resultatBilanB;
    private String rapportBilanB;
    
    // Identifiant de la Néphropathie de référence
    private Integer nephropathieId;
    private String nephropathieTypeClinique; // ex: "Syndrome Néphrotique" pour l'affichage Frontend
}