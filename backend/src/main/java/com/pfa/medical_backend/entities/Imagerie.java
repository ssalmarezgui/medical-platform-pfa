package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "imagerie")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Imagerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantIm")
    private Integer identifiantIm;

    @Column(name = "ExamenIm", length = 256)
    private String examenIm;

    @Column(name = "DateIm")
    private LocalDate dateIm;

    @Column(name = "ResultatIm", length = 512)
    private String resultatIm;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true)
    private Donneur donneur;
}