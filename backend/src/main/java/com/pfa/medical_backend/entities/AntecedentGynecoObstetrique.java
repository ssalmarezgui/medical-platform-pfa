package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "antecedent_gyneco_obstetrique")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AntecedentGynecoObstetrique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAGO")
    private Integer identifiantAGO;

    @Column(name = "DatePremieresRegles")
    private LocalDate datePremieresRegles;

    @Column(name = "Menopause")
    private String menopause;

    @Column(name = "GrossessesNombreTotal")
    private Integer grossessesNombreTotal;

    @Column(name = "GrossessesAvortementsProvoques")
    private Integer grossessesAvortementsProvoques;

    @Column(name = "GrossessesPreeclampsie")
    private Integer grossessesPreeclampsie;

    @Column(name = "GrossessesAccouchementsPrematures")
    private Integer grossessesAccouchementsPrematures;

    @Column(name = "GrossessesAvortementsSpontanes")
    private Integer grossessesAvortementsSpontanes;

    @Column(name = "GrossessesCesarienne")
    private Integer grossessesCesarienne;

    @Column(name = "ContraceptionMethodes")
    private String contraceptionMethodes;

    @Column(name = "ContraceptionDuree")
    private String contraceptionDuree;

    @Column(name = "PathologieMammaireGyneco", columnDefinition = "TEXT")
    private String pathologieMammaireGyneco;

    // Relation
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;
}