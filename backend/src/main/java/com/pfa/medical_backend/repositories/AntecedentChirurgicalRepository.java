package com.pfa.medical_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.AntecedentChirurgical;

@Repository
public interface AntecedentChirurgicalRepository extends JpaRepository<AntecedentChirurgical, Integer> {
    
}
