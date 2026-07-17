package com.pfa.medical_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class HospitalStatsDTO {
    private String hospitalName;
    private Long patientCount;
}