package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pfa.medical_backend.entities.BilanGreffe;

public interface BilanGreffeRepository extends JpaRepository<BilanGreffe, Integer> {

    List<BilanGreffe> findByPatient_IdentifiantP(String patientId);
}
