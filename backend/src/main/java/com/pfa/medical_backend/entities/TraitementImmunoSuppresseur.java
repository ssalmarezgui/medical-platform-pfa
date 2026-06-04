package com.pfa.medical_backend.entities;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "traitement_immunosupresseur")
@Inheritance(strategy = InheritanceType.JOINED) 
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public abstract class TraitementImmunoSuppresseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantTIS")
    private Integer identifiantTIS;

    @Column(name = "DCITIS")
    private String dciTIS; 

    @Column(name = "DureeTraitementTIS")
    private String dureeTraitementTIS;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false) 
    private PatientIdAdmin patient;

    @OneToMany(mappedBy = "traitement", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Prescription> prescriptions = new HashSet<>();

    @OneToMany(mappedBy = "traitement")
    @JsonIgnore
    private Set<DosageMedSang> dosages = new HashSet<>();

    
}