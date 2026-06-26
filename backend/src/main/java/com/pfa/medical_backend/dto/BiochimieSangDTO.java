package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BiochimieSangDTO {
    private Integer identifiantBCS;
    private String libelleBCS;
    private String descriptionBCS;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}