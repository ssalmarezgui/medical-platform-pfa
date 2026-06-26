package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.HormonesVitamines;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HormonesVitaminesRepository extends JpaRepository<HormonesVitamines, Integer> {
    Optional<HormonesVitamines> findByPatient_IdentifiantP(String patientId);
    Optional<HormonesVitamines> findByDonneur_IdentifiantD(Integer donorId);
}