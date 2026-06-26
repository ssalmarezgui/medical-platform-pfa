package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.AntecedentChirurgical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AntecedentChirurgicalRepository extends JpaRepository<AntecedentChirurgical, Integer> {
    
    // Récupérer toutes les opérations d'un patient (via son ID String)
    List<AntecedentChirurgical> findByPatient_IdentifiantP(String patientId);
    List<AntecedentChirurgical> findByDonneur_IdentifiantD(Integer donorId);
}