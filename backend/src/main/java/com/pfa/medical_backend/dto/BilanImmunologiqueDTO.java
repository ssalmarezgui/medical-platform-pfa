package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BilanImmunologiqueDTO {
    private Integer identifiantBI;
    private String typageHLA;
    private String bilanImmuno;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}