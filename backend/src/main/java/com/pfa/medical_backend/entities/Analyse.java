package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "analyse")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Analyse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAna")
    private Integer identifiantAna;

    @Column(name = "DateAna")
    private LocalDate dateAna;

    @Column(name = "ResultatAna", length = 256)
    private String resultatAna;

    @Column(name = "ValeurAna", length = 256)
    private String valeurAna;

    @Column(name = "UniteAna", length = 50)
    private String uniteAna;

    @Column(name = "TypeAnalyse", length = 256)
    private String typeAnalyse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantHH")
    @JsonIgnore
    private HemotologieHemostase hematologie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantBUF")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BiochimieUrines biochimieUrines;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantBCS")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BiochimieSang biochimieSang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantHV")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private HormonesVitamines hormonesVitamines;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantMS")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private MicrobiologieSerologie microbiologieSerologie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantBI")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BilanImmunologique bilanImmunologique;
}