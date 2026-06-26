package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Dialyse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DialyseRepository extends JpaRepository<Dialyse, Integer> {
    
    // Récupérer l'historique des dialyses associées à une pathologie rénale spécifique
    List<Dialyse> findByNephropathie_IdentifiantNI(Integer nephropathieId);
}