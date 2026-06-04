package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tis_induction")
@PrimaryKeyJoinColumn(name = "IdentifiantTIS_I")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class TisInduction extends TraitementImmunoSuppresseur {

    @Column(name = "GrafalonTIS_I")
    private Boolean grafalon;

    @Column(name = "ATGTIS_I")
    private Boolean atg;

    @Column(name = "TymoglobulineTIS_I")
    private Boolean tymoglobuline;

    @Column(name = "SimulectTIS_I")
    private Boolean simulect;
}