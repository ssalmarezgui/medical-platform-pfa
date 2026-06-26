package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    
    // Récupérer toutes les prescriptions d'un traitement spécifique (ID du traitement)
    List<Prescription> findByTraitement_IdentifiantTIS(Integer traitementId);
}