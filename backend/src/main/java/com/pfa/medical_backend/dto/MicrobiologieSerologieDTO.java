package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class MicrobiologieSerologieDTO {
    private Integer identifiantMS;
    private String typeMS;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}