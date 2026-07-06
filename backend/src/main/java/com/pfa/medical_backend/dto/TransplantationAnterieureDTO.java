package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TransplantationAnterieureDTO {
    private Integer identifiantTR;
    private LocalDate dateTR;
    private String lieuTR;
    private String lieuSuiviTR;
    private String typeDonneur;
    private String hlaDonneur;
    private String traitementImmunoSuppresseurInduction;
    private String traitementImmunoSuppresseurEntretien;
    private String causePerteGreffonRenale;
    private LocalDate dateRetourDialyse;
    private Boolean transplantectomie;
    private String transplantectomieIndication;
    private String patientId;
}