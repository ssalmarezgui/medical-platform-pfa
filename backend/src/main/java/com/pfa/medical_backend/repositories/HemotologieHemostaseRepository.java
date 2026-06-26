package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.HemotologieHemostase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HemotologieHemostaseRepository extends JpaRepository<HemotologieHemostase, Integer> {
    Optional<HemotologieHemostase> findByPatient_IdentifiantP(String patientId);
    Optional<HemotologieHemostase> findByDonneur_IdentifiantD(Integer donorId);
}