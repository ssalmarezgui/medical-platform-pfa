package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.MicrobiologieSerologie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MicrobiologieSerologieRepository extends JpaRepository<MicrobiologieSerologie, Integer> {
    Optional<MicrobiologieSerologie> findByPatient_IdentifiantP(String patientId);
    Optional<MicrobiologieSerologie> findByDonneur_IdentifiantD(Integer donorId);
}