package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ImagerieDTO {
    private Integer identifiantIm;
    private String examenIm;
    private LocalDate dateIm;
    private String resultatIm;
    private String patientId;
    private Integer donorId;
}