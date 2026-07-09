package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class ServiceDTO {
    private Integer identifiantS;
    private String libelleS;
    private Integer nbLitsS;
    private Integer nbChambresS;
    
    private Integer nbMedecinsS; 

    private String idHopital; 
    private String hopitalLibelle;
}