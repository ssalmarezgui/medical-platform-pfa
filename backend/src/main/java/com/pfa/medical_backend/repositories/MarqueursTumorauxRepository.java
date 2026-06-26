package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.MarqueursTumoraux;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarqueursTumorauxRepository extends JpaRepository<MarqueursTumoraux, Integer> {
    
    // Récupérer tous les dosages de marqueurs d'un patient spécifique (ID String)
    List<MarqueursTumoraux> findByPatient_IdentifiantP(String patientId);
    List<MarqueursTumoraux> findByDonneur_IdentifiantD(Integer donorId);
}