package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Transplantation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransplantationRepository extends JpaRepository<Transplantation, Integer> {


    // Récupérer toutes les transplantations d'un patient spécifique 

    List<Transplantation> findByPatient_IdentifiantP(String patientId);

    // Récupérer toutes les transplantations liées à un donneur spécifique 

    List<Transplantation> findByDonneur_IdentifiantD(Integer donneurId);



    // Trouver les transplantations par lieu de greffe (par hopital)

    List<Transplantation> findByLieuDeLaGreffeContainingIgnoreCase(String lieu);

    // Trouver les transplantations effectuées à une date précise
    List<Transplantation> findByDateTr(LocalDate date);

    // Trouver les transplantations effectuées entre deux dates
    List<Transplantation> findByDateTrBetween(LocalDate startDate, LocalDate endDate);




    // Récupérer les transplantations ayant eu un rejet aigu la première année
    List<Transplantation> findByRejetAigu1ereAnneeTrue();

    // Récupérer les transplantations où le greffon est toujours vivant

    List<Transplantation> findByVivantGreffonTrue();

    // pour trouver une transplantation par le nom du patient
 
    @Query("SELECT t FROM Transplantation t WHERE LOWER(t.patient.nomP) LIKE LOWER(CONCAT('%', :nom, '%'))")
    List<Transplantation> findByPatientNom(@Param("nom") String nom);
}