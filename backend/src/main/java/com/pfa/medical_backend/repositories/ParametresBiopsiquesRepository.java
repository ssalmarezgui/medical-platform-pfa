package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.ParametresBiopsiques;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParametresBiopsiquesRepository extends JpaRepository<ParametresBiopsiques, Integer> {
    
    // Récupérer le dossier biopsique associé à une pathologie rénale de patient spécifique
    Optional<ParametresBiopsiques> findByNephropathie_IdentifiantNI(Integer nephropathieId);
}