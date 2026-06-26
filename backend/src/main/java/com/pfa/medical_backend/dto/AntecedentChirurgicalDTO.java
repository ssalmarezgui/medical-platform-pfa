package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AntecedentChirurgicalDTO {
    private Integer identifiantACH;
    private String intervention;
    private LocalDate date;
    private String lieu;
    private String chirurgien;
    private String evolution;
    private String patientId;
    private Integer donorId;
}