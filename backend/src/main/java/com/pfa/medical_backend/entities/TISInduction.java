package com.pfa.medical_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@DiscriminatorValue("INDUCTION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TISInduction extends TraitementImmunoSuppresseur {

    @Column(name = "GrafalonTIS_I")
    private Boolean grafalonTISI;

    @Column(name = "ATGTIS_I")
    private Boolean atgTISI;

    @Column(name = "TymoglobulineTIS_I")
    private Boolean tymoglobulineTISI;

    @Column(name = "SimulectTIS_I")
    private Boolean simulectTISI;
}