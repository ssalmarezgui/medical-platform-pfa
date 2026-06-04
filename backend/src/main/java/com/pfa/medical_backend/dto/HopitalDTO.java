package com.pfa.medical_backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HopitalDTO {
    @Size(min = 10, max = 10, message = "Le code hôpital doit faire 10 caractères")
    private String identifiantH;
    
    private String libelleH;
    private String adresseH;
    private Integer nbLitsH;
    
    private Integer nbServiceH; 
}