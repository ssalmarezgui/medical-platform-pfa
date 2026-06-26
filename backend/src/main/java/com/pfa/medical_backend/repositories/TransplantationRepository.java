package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Transplantation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransplantationRepository extends JpaRepository<Transplantation, Integer> {
    
    // Récupérer l'historique des greffes actives d'un patient spécifique (ID String)
    List<Transplantation> findByPatient_IdentifiantP(String patientId);
    
    // Récupérer les greffes liées à un donneur spécifique
    List<Transplantation> findByDonneur_IdentifiantD(Integer donneurId);
}