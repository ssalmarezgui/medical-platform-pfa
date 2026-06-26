package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.AntecedentChirurgical;
import com.pfa.medical_backend.entities.BilanImmunologique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BilanImmunologiqueRepository extends JpaRepository<BilanImmunologique, Integer> {
    Optional<BilanImmunologique> findByPatient_IdentifiantP(String patientId);
    Optional<BilanImmunologique> findByDonneur_IdentifiantD(Integer donorId);
}