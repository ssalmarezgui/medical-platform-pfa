package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "antecedent_medical")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AntecedentMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAMed")
    private Integer identifiantAMed;

    @Column(name = "Type", length = 256) // Cardio-vasculaires, Diabète sucré, Hépathopathie, etc.
    private String type;

    @Column(name = "SousType", length = 256) // HTA, AVC, Diabète Type 1, etc.
    private String sousType;

    @Column(name = "DateDebut")
    private LocalDate dateDebut;

    @Column(name = "Complication", length = 512) // Retentissement ou complications cochées
    private String complication;

    @Column(name = "Traitement", length = 512) // Médicaments, Insuline, ADO, etc.
    private String traitement;

    @Column(name = "Evolution", length = 512) // Évolution clinique ou séquelles
    private String evolution;

    @Column(name = "TypeLocalisation", length = 256) // Pour l'AVC ou l'artériopathie
    private String typeLocalisation;

    @Column(name = "CauseSiege", length = 256) // Pour l'amputation ou thrombose
    private String causeSiege;

    @Column(name = "LieuPriseEnCharge", length = 512) // Établissement et médecin responsable
    private String lieuPriseEnCharge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true)
    private Donneur donneur;
}