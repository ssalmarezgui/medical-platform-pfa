package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marqueurs_tumoraux")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MarqueursTumoraux {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantMT")
    private Integer identifiantMT;

    @Column(name = "NomM", length = 256)
    private String nomM;

    @Column(name = "Resultat", length = 512)
    private String resultat;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;

}