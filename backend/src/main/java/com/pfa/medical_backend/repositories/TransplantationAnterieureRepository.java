package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.TransplantationAnterieure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransplantationAnterieureRepository extends JpaRepository<TransplantationAnterieure, Integer> {
    
    // Récupérer toutes les transplantations d'un patient (via son ID String)
    List<TransplantationAnterieure> findByPatient_IdentifiantP(String patientId);
}