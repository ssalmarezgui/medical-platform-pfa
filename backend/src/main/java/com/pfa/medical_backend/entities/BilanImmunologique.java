package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bilan_immunologique")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BilanImmunologique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantBI")
    private Integer identifiantBI;

    @Column(name = "TypageHLA", length = 256)
    private String typageHLA;

    @Column(name = "BilanImmuno", length = 512)
    private String bilanImmuno;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;

    @OneToMany(mappedBy = "bilanImmunologique", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analyse> analyses = new ArrayList<>();
}