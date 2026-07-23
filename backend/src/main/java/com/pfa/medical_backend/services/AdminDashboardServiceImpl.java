package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final HopitalStructureSoinRepository hopitalStructureSoinRepository;
    private final ServiceRepository serviceRepository; 
    private final PatientIdAdminRepository patientIdAdminRepository;
    private final TransplantationRepository transplantationRepository;

    @Override
    public AdminDashboardDTO getDashboardStatistics() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        dto.setActiveDoctorsCount(userRepository.countActiveDoctors());
        dto.setPendingDoctorsCount(userRepository.countByActive(false));
        dto.setHospitalsCount(hopitalStructureSoinRepository.count());
        dto.setServicesCount(serviceRepository.count());

        dto.setPatientsPerHospital(patientIdAdminRepository.getPatientsCountPerHospital());
        
        LocalDate sevenDaysAgo = LocalDate.now(ZoneId.of("Africa/Tunis")).minusDays(7);
        dto.setTransplantsPerDay(transplantationRepository.getTransplantsPerDay(sevenDaysAgo));

        return dto;
    }
}