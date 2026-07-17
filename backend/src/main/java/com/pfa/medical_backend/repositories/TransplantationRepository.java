package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.dto.TransplantStatsDTO;
import com.pfa.medical_backend.entities.Transplantation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransplantationRepository extends JpaRepository<Transplantation, Integer> {
    
    // Récupérer l'historique des greffes actives d'un patient spécifique (ID String)
    List<Transplantation> findByPatient_IdentifiantP(String patientId);
    
    // Récupérer les greffes liées à un donneur spécifique
    List<Transplantation> findByDonneur_IdentifiantD(Integer donneurId);

    @Query("SELECT new com.pfa.medical_backend.dto.TransplantStatsDTO(t.dateTR, COUNT(t)) " +
           "FROM Transplantation t " +
           "WHERE t.dateTR >= :startDate " +
           "GROUP BY t.dateTR " +
           "ORDER BY t.dateTR ASC")
    List<TransplantStatsDTO> getTransplantsPerDay(@Param("startDate") java.time.LocalDate startDate);
}