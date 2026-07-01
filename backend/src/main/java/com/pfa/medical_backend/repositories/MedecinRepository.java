package com.pfa.medical_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.entities.ServiceMedical;

import java.util.List;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {


    List<Medecin> findByNomMContainingIgnoreCase(String nom);

    List<Medecin> findByNumTelM(String tel);

    List<Medecin> findBySpecialiteMContainingIgnoreCase(String specialite);

    List<Medecin> findByService(ServiceMedical service);

    List<Medecin> findByService_IdentifiantS(Integer serviceId);

    @Query("SELECT DISTINCT m FROM Medecin m JOIN m.service s JOIN s.hopital h WHERE h.identifiantH = :hopitalId")
    List<Medecin> findByHopitalId(@Param("hopitalId") String hopitalId);

    @Query("SELECT m FROM Medecin m JOIN m.patientsSuivis p WHERE p.identifiantP = :patientId")
    List<Medecin> findMedecinsByPatientId(@Param("patientId") String patientId);
}