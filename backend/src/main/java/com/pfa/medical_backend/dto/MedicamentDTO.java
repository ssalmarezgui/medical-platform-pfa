package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class MedicamentDTO {
    private Integer identifiantMed;
    private String nomCommercialMed;
    private String descriptionMed;
    private String typeMed;
    private String posologieMed;
}