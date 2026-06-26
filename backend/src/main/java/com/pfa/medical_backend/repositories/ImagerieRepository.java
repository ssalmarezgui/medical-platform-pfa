package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Imagerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImagerieRepository extends JpaRepository<Imagerie, Integer> {
    
    List<Imagerie> findByPatient_IdentifiantP(String patientId);
    List<Imagerie> findByDonneur_IdentifiantD(Integer donorId);
}