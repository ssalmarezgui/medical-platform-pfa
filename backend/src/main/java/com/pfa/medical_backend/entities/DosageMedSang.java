package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "dosage_med_sang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DosageMedSang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantDMS")
    private Integer identifiantDMS;

    @Column(name = "DateDMS")
    private LocalDate dateDMS;

    @Column(name = "LabelDMS", length = 256)
    private String labelDMS;

    @Column(name = "ValeurDMS", length = 256)
    private String valeurDMS;

    @Column(name = "ObservationDMS", columnDefinition = "TEXT")
    private String observationDMS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantTIS", nullable = false)
    private TraitementImmunoSuppresseur traitement;
}