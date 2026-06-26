package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nephropathie_initiale")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NephropathieInitiale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantNI")
    private Integer identifiantNI;

    @Column(name = "TypeCliniqueNI", length = 256)
    private String typeCliniqueNI;

    @Column(name = "CauseNI", length = 256)
    private String causeNI;

    @Column(name = "TypeHistologiqueNI", length = 256)
    private String typeHistologiqueNI;

    @Column(name = "StadeMaladiNI", length = 256)
    private String stadeMaladiNI;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;
    
}