package com.pfa.medical_backend.dto;

import java.time.LocalDate;

import com.pfa.medical_backend.entities.TypeMedecin;
import lombok.Data;


@Data
public class MedecinDTO {
    private Long identifiantM;
    private String nomM;
    private String prenomM;
    private LocalDate dateNaissM;
    private String sexeM;
    private String numTelM;
    private String numTelWhapAPPM;
    private String adresseDomM;
    private String specialiteM;
    private LocalDate dateDernierDiplomeM;
    private String indexHopitalM;
    private String autreInfo; 
    private TypeMedecin typeMedecin;
    
    

    private Integer serviceId;
    private String serviceLibelle;
}