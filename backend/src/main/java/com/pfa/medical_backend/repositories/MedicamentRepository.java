package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentRepository extends JpaRepository<Medicament, Integer> {
    
    // Rechercher des médicaments par type (ex: récupérer uniquement les immunosuppresseurs pour les lister)
    List<Medicament> findByTypeMedContainingIgnoreCase(String typeMed);
    
    // Recherche par nom commercial
    List<Medicament> findByNomCommercialMedContainingIgnoreCase(String nomCommercial);
}