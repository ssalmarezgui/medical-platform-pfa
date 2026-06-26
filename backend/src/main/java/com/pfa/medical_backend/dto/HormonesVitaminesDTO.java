package com.pfa.medical_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class HormonesVitaminesDTO {
    private Integer identifiantHV;
    private String typeHV;
    private String patientId;
    private Integer donorId;
    private List<AnalyseDTO> analyses;
}