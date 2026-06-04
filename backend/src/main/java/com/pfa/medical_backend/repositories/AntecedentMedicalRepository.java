package com.pfa.medical_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.AntecedentMedical;

@Repository
public interface AntecedentMedicalRepository extends JpaRepository<AntecedentMedical, Integer> {
    
}
