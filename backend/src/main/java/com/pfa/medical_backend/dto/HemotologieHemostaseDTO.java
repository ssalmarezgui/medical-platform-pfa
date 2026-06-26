package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class HemotologieHemostaseDTO {
    private Integer identifiantHH;
    private String groupeSanguin;
    private String phenotypage;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}