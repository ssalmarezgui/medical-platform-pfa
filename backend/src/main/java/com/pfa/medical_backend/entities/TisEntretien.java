package com.pfa.medical_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@DiscriminatorValue("ENTRETIEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TISEntretien extends TraitementImmunoSuppresseur {

    @Column(name = "MMFTIS_E")
    private Boolean mmfTISE;

    @Column(name = "AzathioprineTIS_E")
    private Boolean azathioprineTISE;

    @Column(name = "CyclusporineTIS_E")
    private Boolean cyclusporineTISE;

    @Column(name = "TacrolimusTIS_E")
    private Boolean tacrolimusTISE;

    @Column(name = "PrednisoleTIS_E")
    private Boolean prednisoleTISE;

    @Column(name = "PrednisoluneTIS_E")
    private Boolean prednisoluneTISE;

    @Column(name = "Sirolimus")
    private Boolean sirolimus;
}