package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AntecedentFamilialDTO {
    private Integer identifiantAF;
    private String consanguinite;
    private String typeRelation;
    private LocalDate dateDeNaissance;
    private String profession;
    private String tares;
    private String patientId;
    private Integer donorId;
}