package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DonneurDTO {

    private Integer identifiantD;
    private String indexHopitalD;
    private Integer numeroCin;


    private String nomD;
    private String prenomD;
    private LocalDate dateNaissD;
    private String sexeD;
    private String nationaliteD;
    private String origineGeogD;


    private String adresseD;
    private String telephoneD;
    private String adressEmailD;
    private String telephoneWhatsAppD;
    private String personneAcontacterD;
    private String typeCarnetD;
    private String numCarnetD;


    private Boolean adulteD;
    private String statut; 
    private String evolution;
    private String niveauEducation;
    private Boolean enEtatActivite;
    
    private String typeDonneur; 
}