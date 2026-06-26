package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TransplantationDTO {
    private Integer numeroTR;
    private LocalDate dateTR;
    private String lieuDeLaGreffe;
    private String lieuDeSuivi;
    private Integer nbTransplantation;
    private Integer nbUretere;
    private String rein;
    private Integer nbArtereVeine;
    private Boolean kystes;
    private String typeAnomalie;
    private Integer dureeIschemieFroide;
    private Integer dureeIschemieChaude;
    private String liquideConservation;
    private String liquideRincage;
    private Boolean machineAPerfusion;
    private String typeAnastomoseArterielle;
    private String typeAnastomoseVeineuse;
    private String typeAnastomoseUreteroVesicale;
    private Boolean sondeEnDoubleJJ;
    
    private String patientId;
    private String patientNomComplet;
    private Integer donneurId;
    private String donneurNomComplet;
}