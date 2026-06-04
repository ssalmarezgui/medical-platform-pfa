package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.ServiceMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceMedical, Integer> {
    
    List<ServiceMedical> findByHopital_IdentifiantH(String hopitalId);
    
    List<ServiceMedical> findByLibelleSContainingIgnoreCase(String libelle);

    List<ServiceMedical> findByNbLitsSGreaterThan(Integer minLits);
}