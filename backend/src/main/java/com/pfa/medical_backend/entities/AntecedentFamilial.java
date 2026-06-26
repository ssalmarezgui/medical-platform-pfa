package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "antecedent_familial")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AntecedentFamilial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAF")
    private Integer identifiantAF;

    @Column(name = "Consanguinite") // Absente, 1er deg, 2ème deg, >2ème deg
    private String consanguinite;

    @Column(name = "TypeRelation") // Pere, Mere, Frere, Soeur, Epouse/Epoux, Descendants
    private String typeRelation;

    @Column(name = "DateDeNaissance")
    private LocalDate dateDeNaissance;

    @Column(name = "Profession")
    private String profession;

    @Column(name = "Tares") // HTA, Diabète sucré, Autre
    private String tares;



    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true)
    private Donneur donneur;
}