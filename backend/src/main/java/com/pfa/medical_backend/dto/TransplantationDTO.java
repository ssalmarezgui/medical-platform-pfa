package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TransplantationDTO {
    private Integer numeroTr;
    private LocalDate dateTr;
    private String lieuDeLaGreFFE;
    

    private String rein;
    private String nbTransplantation;
    private String liquideDeConservation;
    private Boolean sondeEnDoubleJ;
    private Boolean rejetAigu1ereAnnee;

    // Infos Receveur
    private String patientId;
    private String patientNomComplet;

    // Infos Donneur
    private Integer donneurId;
    private String donneurNomComplet;
    private String typeDonneur;
}