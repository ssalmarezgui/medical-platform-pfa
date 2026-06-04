package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tis_entretien")
@PrimaryKeyJoinColumn(name = "IdentifiantTIS_E")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class TisEntretien extends TraitementImmunoSuppresseur {

    @Column(name = "MMFTIS_E")
    private Boolean mmf;

    @Column(name = "AzathioprineTIS_E")
    private Boolean azathioprine;

    @Column(name = "CyclusporineTIS_E")
    private Boolean cyclusporine;

    @Column(name = "TacrolimusTIS_E")
    private Boolean tacrolimus;

    @Column(name = "PrednisoleTIS_E")
    private Boolean prednisole;

    @Column(name = "PrednisoluneTIS_E")
    private Boolean prednisolune;

    @Column(name = "Sirolimus")
    private Boolean sirolimus;
}