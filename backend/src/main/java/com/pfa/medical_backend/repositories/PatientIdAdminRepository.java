package com.pfa.medical_backend.repositories;
import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.entities.ServiceMedical;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



import java.util.List;
import java.util.Optional;

@Repository
public interface PatientIdAdminRepository extends JpaRepository<PatientIdAdmin, String> {
    List<PatientIdAdmin> findByNomPContainingIgnoreCaseOrPrenomPContainingIgnoreCase(String nom, String prenom);

    Optional<PatientIdAdmin> findByNumeroCin(Integer numeroCin);

    List<PatientIdAdmin> findByIndexHopitalP(String indexHopitalP);

    List<PatientIdAdmin> findByAdultePTrue();

    List<PatientIdAdmin> findByAdultePFalse();

    @Query("SELECT DISTINCT p FROM PatientIdAdmin p JOIN p.affectations a WHERE a.service = :service")
    List<PatientIdAdmin> findByService(@Param("service") ServiceMedical service);

    @Query("SELECT p FROM PatientIdAdmin p JOIN p.medecinsSuivi m WHERE m = :medecin")
    List<PatientIdAdmin> findByMedecinSuiveur(@Param("medecin") Medecin medecin);

    @Query("SELECT DISTINCT p FROM PatientIdAdmin p JOIN p.affectations a JOIN a.service s JOIN s.hopital h WHERE h.identifiantH = :hopitalId")
    List<PatientIdAdmin> findByHopitalId(@Param("hopitalId") String userHopitalId);
}