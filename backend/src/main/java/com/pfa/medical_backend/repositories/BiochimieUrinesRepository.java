package com.pfa.medical_backend.repositories;
import com.pfa.medical_backend.entities.BiochimieUrines;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BiochimieUrinesRepository extends JpaRepository<BiochimieUrines, Integer> {
    Optional<BiochimieUrines> findByPatient_IdentifiantP(String patientId);
    Optional<BiochimieUrines> findByDonneur_IdentifiantD(Integer donorId);
}