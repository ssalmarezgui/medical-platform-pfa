package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class NephropathieInitialeDTO {
    private Integer identifiantNI;
    private String typeCliniqueNI;
    private String causeNI;
    private String typeHistologiqueNI;
    private String stadeMaladiNI;
    private String patientId; // Clé étrangère String
}