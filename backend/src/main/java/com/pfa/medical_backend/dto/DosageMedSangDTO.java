package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DosageMedSangDTO {
    private Integer identifiantDMS;
    private LocalDate dateDMS;
    private String labelDMS;
    private String valeurDMS;
    private String observationDMS;
    private Integer traitementId;
}