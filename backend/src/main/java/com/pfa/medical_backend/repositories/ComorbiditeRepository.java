package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.Comorbidite;

@Repository
public interface ComorbiditeRepository extends JpaRepository<Comorbidite, Integer> {

    List<Comorbidite> findByPatients_IdentifiantP(String patientId);
}