package com.pfa.medical_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pfa.medical_backend.entities.Greffe;

public interface GreffeRepository extends JpaRepository<Greffe, Integer> {
}