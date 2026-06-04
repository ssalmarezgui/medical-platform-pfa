package com.pfa.medical_backend.dto;

import lombok.Data;

@Data
public class InteractionDTO {
    private Integer medicamentSourceId;
    private String medicamentSourceNom;
    
    private Integer medicamentCibleId;
    private String medicamentCibleNom;
    
    private String descriptionInteraction;
}