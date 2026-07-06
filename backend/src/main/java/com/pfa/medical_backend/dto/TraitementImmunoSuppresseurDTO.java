package com.pfa.medical_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TraitementImmunoSuppresseurDTO {
    private Integer id;
    private String dciTIS;
    private String durerTraitementTIS;
    private String patientId;
    
    private String type;

    private Boolean grafalonTISI;
    private Boolean atgTISI;
    private Boolean tymoglobulineTISI;
    private Boolean simulectTISI;

    private Boolean mmfTISE;
    private Boolean azathioprineTISE;
    private Boolean cyclusporineTISE;
    private Boolean tacrolimusTISE;
    private Boolean prednisoleTISE;
    private Boolean prednisoluneTISE;
    private Boolean sirolimus;
}