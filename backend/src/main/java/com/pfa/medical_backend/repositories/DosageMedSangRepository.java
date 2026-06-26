package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.DosageMedSang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DosageMedSangRepository extends JpaRepository<DosageMedSang, Integer> {
    
    // Récupérer les dosages sanguins associés à un dossier d'immuno-suppression de patient spécifique
    List<DosageMedSang> findByTraitement_IdentifiantTIS(Integer traitementId);
}