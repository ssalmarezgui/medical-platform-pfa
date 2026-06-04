package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PatientDTO {

    
    private String identifiantP;
    private String indexHopitalP;
    private Integer numeroCin;


    private String nomP;
    private String prenomP;
    private LocalDate dateNaissP;
    private String sexeP;
    private String nationaliteP;
    private String origineGeogP;


    private String adresseP;
    private String telephoneP;
    private String adressEmailP;
    private String telephoneWhatsAppP;
    private String personneAcontacterP;
    private String typeCarnetP;
    private String numCarnetP;


    private Boolean adulteP;
    private String statut; 
    private String evolution;
    private String niveauEducation;
    private Boolean enEtatActivite;


    private Integer medecinInvestigateurId;
    private String medecinInvestigateurNom;
    private List<Integer> serviceIds;
}