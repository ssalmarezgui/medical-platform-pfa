package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "biochimie_urines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BiochimieUrines {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantBUF")
    private Integer identifiantBUF;

    @Column(name = "LibelleBUF", length = 256) // ex: "Biochimie Urinaire et Fluides"
    private String libelleBUF;

    @Column(name = "DescriptionBUF", length = 512) // Remarques / Observations
    private String descriptionBUF;

    // relation
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;

    // Composition 1,n vers les Analyses biologiques associées
    @OneToMany(mappedBy = "biochimieUrines", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analyse> analyses = new ArrayList<>();
}