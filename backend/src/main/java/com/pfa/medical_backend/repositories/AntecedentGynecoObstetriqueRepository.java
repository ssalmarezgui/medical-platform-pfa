package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.AntecedentChirurgical;
import com.pfa.medical_backend.entities.AntecedentGynecoObstetrique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AntecedentGynecoObstetriqueRepository extends JpaRepository<AntecedentGynecoObstetrique, Integer> {
    
    // Rechercher l'antécédent gynéco d'une patiente spécifique (Relation One-to-One)
    Optional<AntecedentGynecoObstetrique> findByPatient_IdentifiantP(String patientId);
    Optional<AntecedentGynecoObstetrique> findByDonneur_IdentifiantD(Integer donorId);
}