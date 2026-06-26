package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DialyseDTO {
    private Integer identifiantDia;
    private String typeDialyse;
    private LocalDate dateDebutDialyse;
    private String rythmeDialyse;
    private String centreDialyse;
    private Integer nephropathieId; // Uniquement l'ID de liaison
}