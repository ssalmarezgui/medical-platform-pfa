package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final HopitalStructureSoinRepository hopitalStructureSoinRepository;
    private final ServiceRepository serviceRepository; 
    private final PatientIdAdminRepository patientIdAdminRepository;
    private final TransplantationRepository transplantationRepository;

    public AdminDashboardServiceImpl(UserRepository userRepository, 
                                     HopitalStructureSoinRepository hopitalStructureSoinRepository,
                                     ServiceRepository serviceRepository, 
                                     PatientIdAdminRepository patientIdAdminRepository,
                                     TransplantationRepository transplantationRepository) {
        this.userRepository = userRepository;
        this.hopitalStructureSoinRepository = hopitalStructureSoinRepository;
        this.serviceRepository = serviceRepository;
        this.patientIdAdminRepository = patientIdAdminRepository;
        this.transplantationRepository = transplantationRepository;
    }

    @Override
    public AdminDashboardDTO getDashboardStatistics() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        dto.setActiveDoctorsCount(userRepository.countActiveDoctors());
        dto.setPendingDoctorsCount(userRepository.countByActive(false));
        dto.setHospitalsCount(hopitalStructureSoinRepository.count());
        dto.setServicesCount(serviceRepository.count());

        dto.setPatientsPerHospital(patientIdAdminRepository.getPatientsCountPerHospital());

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        dto.setTransplantsPerDay(transplantationRepository.getTransplantsPerDay(sevenDaysAgo));

        return dto;
    }
}