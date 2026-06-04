package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentRepository extends JpaRepository<Medicament, Integer> {

    // Recherche par nom commercial
    List<Medicament> findByNomCommercialMedContainingIgnoreCase(String nom);

    // Récupérer tous les médicaments prescrits à un patient
    @Query("SELECT DISTINCT m FROM Medicament m " +
           "JOIN m.prescriptions p " +
           "WHERE p.traitement.patient.identifiantP = :patientId")
    List<Medicament> findByPatientId(@Param("patientId") String patientId);

    // Récupérer les interactions d'un médicament donné
    @Query("SELECT m.interactions FROM Medicament m WHERE m.identifiantMed = :medId")
    List<Medicament> findInteractions(@Param("medId") Integer medId);
}