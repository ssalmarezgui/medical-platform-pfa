package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AnalyseDTO {
    private Integer identifiantAna;
    private LocalDate dateAna;
    private String resultatAna;
    private String valeurAna;
    private String uniteAna;
    private String typeAnalyse;
}