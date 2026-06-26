package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class MarqueursTumorauxDTO {
    private Integer identifiantMT;
    private String nomM;
    private String resultat;
    private String patientId;
    private Integer donorId;
}