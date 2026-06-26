package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.TraitementImmunoSuppresseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TraitementImmunoSuppresseurRepository extends JpaRepository<TraitementImmunoSuppresseur, Integer> {
    
    // Récupérer tout l'historique d'immuno-suppression d'un patient (ID String)
    List<TraitementImmunoSuppresseur> findByPatient_IdentifiantP(String patientId);
}