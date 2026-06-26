package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class EffetSecondaireDTO {
    private Integer identifiantEFS;
    private String libelleEFS;
    private String descriptionEFS;
    private String recommendationEFS;
    
    private Integer prescriptionId;
    private String medicamentNom;
}