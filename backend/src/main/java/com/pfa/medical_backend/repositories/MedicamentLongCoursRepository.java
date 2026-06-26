package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.MedicamentLongCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentLongCoursRepository extends JpaRepository<MedicamentLongCours, Integer> {
    
    List<MedicamentLongCours> findByPatient_IdentifiantP(String patientId);
    List<MedicamentLongCours> findByDonneur_IdentifiantD(Integer donorId);
}