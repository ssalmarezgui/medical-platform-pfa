package com.pfa.medical_backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.Dialyse;

@Repository
public interface DialyseRepository extends JpaRepository<Dialyse, Integer> {
}
