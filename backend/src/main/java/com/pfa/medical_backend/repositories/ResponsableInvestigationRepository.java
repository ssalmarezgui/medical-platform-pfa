package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.ResponsableInvestigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResponsableInvestigationRepository extends JpaRepository<ResponsableInvestigation, Integer> {


    List<ResponsableInvestigation> findByPatient_IdentifiantP(String patientId);


    List<ResponsableInvestigation> findByMedecin_IdentifiantM(Integer medecinId);

    List<ResponsableInvestigation> findByDateDebut(LocalDate date);

    List<ResponsableInvestigation> findByDateDebutBetween(LocalDate startDate, LocalDate endDate);
}