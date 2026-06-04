package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.TraitementImmunoSuppresseur;

@Repository
public interface TraitementImmunoSuppresseurRepository extends JpaRepository<TraitementImmunoSuppresseur, Integer> {
    
    List<TraitementImmunoSuppresseur> findByPatient_IdentifiantP(String patientId);

    @Query("SELECT t FROM TraitementImmunoSuppresseur t WHERE TYPE(t) = TisInduction AND t.patient.identifiantP = :id")
    List<TraitementImmunoSuppresseur> findInductionsByPatient(@Param("id") String patientId);
}
