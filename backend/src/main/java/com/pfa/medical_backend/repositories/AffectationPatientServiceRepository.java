package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.AffectationPatientService;

@Repository
public interface AffectationPatientServiceRepository extends JpaRepository<AffectationPatientService, Integer> {
    List<AffectationPatientService> findByPatient_IdentifiantP(String patientId);
    List<AffectationPatientService> findByService_IdentifiantS(Integer serviceId);
}
