package com.pfa.medical_backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.Donneur;

@Repository
public interface DonneurRepository extends JpaRepository<Donneur, Integer> {
    Optional<Donneur> findByCinD(Integer cin);

    List<Donneur> findByTypeDonneur(String typeDonneur);

    
    List<Donneur> findByNomDContainingIgnoreCase(String nom);
}
