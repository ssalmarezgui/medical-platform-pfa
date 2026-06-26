package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BiochimieUrinesDTO {
    private Integer identifiantBUF;
    private String libelleBUF;
    private String descriptionBUF;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}