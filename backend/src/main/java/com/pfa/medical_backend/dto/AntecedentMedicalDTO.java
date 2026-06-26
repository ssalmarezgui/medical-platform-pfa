package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AntecedentMedicalDTO {
    private Integer identifiantAMed;
    private String type;
    private String sousType;
    private LocalDate dateDebut;
    private String complication;
    private String traitement;
    private String evolution;
    private String typeLocalisation;
    private String causeSiege;
    private String lieuPriseEnCharge;
    private String patientId;
    private Integer donorId;
}