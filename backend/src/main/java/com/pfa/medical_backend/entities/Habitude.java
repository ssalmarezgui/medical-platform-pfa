package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "habitude")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Habitude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantHA")
    private Integer identifiantHA;

    @Column(name = "LibelleHA") 
    private String libelleHA;

    @Column(name = "TypeSubstance")
    private String typeSubstance;

    @Column(name = "Details")
    private String details;

    @Column(name = "QuantiteConsomme")
    private String quantiteConsomme;

    @Column(name = "PeriodeExposition")
    private String periodeExposition;

    @Column(name = "Sevrage")
    private String sevrage;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true)
    private Donneur donneur;
}