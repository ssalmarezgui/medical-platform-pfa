package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MedicamentLongCoursDTO {
    private Integer identifiantMLC;
    private String libelleMLC;
    private String molecule;
    private String indication;
    private LocalDate debutTraitement;
    private String patientId;
    private Integer donorId;
}