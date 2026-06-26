package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PrescriptionDTO {
    private Integer identifiantPrescription;
    private LocalDate datePremierePrise;
    private String dosageMed;
    private LocalDate dateSortie;

    private Integer traitementId;
    private Integer medicamentId;
    private String medicamentNomCommercial;
    private String medicamentType;
}