package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "antecedent_chirurgical")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AntecedentChirurgical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantACH")
    private Integer identifiantACH;

    @Column(name = "Intervention", length = 256)
    private String intervention;

    @Column(name = "Date")
    private LocalDate date;

    @Column(name = "Lieu", length = 256)
    private String lieu;

    @Column(name = "Chirurgien", length = 256)
    private String chirurgien;

    @Column(name = "Evolution", length = 256)
    private String evolution;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true)
    private Donneur donneur;
}