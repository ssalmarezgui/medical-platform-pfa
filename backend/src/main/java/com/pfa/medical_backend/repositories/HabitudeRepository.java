package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Habitude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HabitudeRepository extends JpaRepository<Habitude, Integer> {
    
    List<Habitude> findByPatient_IdentifiantP(String patientId);
    List<Habitude> findByDonneur_IdentifiantD(Integer donorId);
}