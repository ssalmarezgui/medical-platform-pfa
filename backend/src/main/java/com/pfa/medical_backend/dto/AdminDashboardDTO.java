package com.pfa.medical_backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class AdminDashboardDTO {
    private Long activeDoctorsCount;
    private Long pendingDoctorsCount;
    private Long hospitalsCount;
    private Long servicesCount;
    
    private List<HospitalStatsDTO> patientsPerHospital;
    private List<TransplantStatsDTO> transplantsPerDay;
}