package com.pfa.medical_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.NephropathieInitiale;

@Repository
public interface NephropathieInitialeRepository extends JpaRepository<NephropathieInitiale, Integer> {
    
}
