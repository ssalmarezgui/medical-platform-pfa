package com.pfa.medical_backend.repositories;
import com.pfa.medical_backend.entities.AntecedentFamilial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AntecedentFamilialRepository extends JpaRepository<AntecedentFamilial, Integer> {
    
    List<AntecedentFamilial> findByPatient_IdentifiantP(String patientId);
    List<AntecedentFamilial> findByDonneur_IdentifiantD(Integer donorId);
}