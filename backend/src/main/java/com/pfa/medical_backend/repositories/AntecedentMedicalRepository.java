package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.AntecedentMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AntecedentMedicalRepository extends JpaRepository<AntecedentMedical, Integer> {
    
    // Récupérer les antécédents médicaux d'un patient (via son ID String)
    List<AntecedentMedical> findByPatient_IdentifiantP(String patientId);
    List<AntecedentMedical> findByDonneur_IdentifiantD(Integer donorId);
}