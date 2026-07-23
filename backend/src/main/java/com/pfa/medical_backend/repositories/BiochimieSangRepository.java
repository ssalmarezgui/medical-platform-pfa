package com.pfa.medical_backend.repositories;
import com.pfa.medical_backend.entities.BiochimieSang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BiochimieSangRepository extends JpaRepository<BiochimieSang, Integer> {
    Optional<BiochimieSang> findByPatient_IdentifiantP(String patientId);
    Optional<BiochimieSang> findByDonneur_IdentifiantD(Integer donorId);
}