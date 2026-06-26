package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Analyse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyseRepository extends JpaRepository<Analyse, Integer> {
    List<Analyse> findByTypeAnalyse(String typeAnalyse);
}