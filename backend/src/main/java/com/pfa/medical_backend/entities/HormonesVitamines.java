package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hormones_vitamines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HormonesVitamines {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantHV")
    private Integer identifiantHV;

    @Column(name = "TypeHV", length = 256)
    private String typeHV;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = true, unique = true)
    private PatientIdAdmin patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = true, unique = true)
    private Donneur donneur;

    @OneToMany(mappedBy = "hormonesVitamines", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analyse> analyses = new ArrayList<>();
}