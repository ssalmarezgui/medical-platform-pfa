package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class HabitudeDTO {
    private Integer identifiantHA;
    private String libelleHA;
    private String typeSubstance;
    private String details;
    private String quantiteConsomme;
    private String periodeExposition;
    private String sevrage;
    private String patientId;
    private Integer donorId;
}