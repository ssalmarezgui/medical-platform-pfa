package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.DosageMedSang;

@Repository
public interface DosageMedSangRepository extends JpaRepository<DosageMedSang, Integer> {
    List<DosageMedSang> findByTraitement_Patient_IdentifiantP(String patientId);
}
