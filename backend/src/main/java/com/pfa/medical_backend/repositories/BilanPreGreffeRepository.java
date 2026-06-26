package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.BilanPreGreffe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BilanPreGreffeRepository extends JpaRepository<BilanPreGreffe, Integer> {
    
    // Récupérer tous les bilans pré-greffe associés à une néphropathie spécifique (ID de la néphropathie)
    List<BilanPreGreffe> findByNephropathie_IdentifiantNI(Integer nephropathieId);
}