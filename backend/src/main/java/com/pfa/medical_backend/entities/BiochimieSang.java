package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "biochimie_sang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BiochimieSang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantBCS")
    private Integer identifiantBCS;

    @Column(name = "LibelleBCS", length = 256) // ex: "Biochimie Sanguine"
    private String libelleBCS;

    @Column(name = "DescriptionBCS", length = 512) // Observations / Remarques
    private String descriptionBCS;

    // Lien One-to-One d'admission vers le Patient
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;

    // Composition 1,n vers les Analyses biologiques associées
    @OneToMany(mappedBy = "biochimieSang", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analyse> analyses = new ArrayList<>();
}