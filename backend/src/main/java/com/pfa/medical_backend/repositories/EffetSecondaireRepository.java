package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.EffetSecondaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EffetSecondaireRepository extends JpaRepository<EffetSecondaire, Integer> {
    
    // Récupérer les effets secondaires liés à une prescription spécifique
    List<EffetSecondaire> findByPrescription_IdentifiantPrescription(Integer prescriptionId);
}