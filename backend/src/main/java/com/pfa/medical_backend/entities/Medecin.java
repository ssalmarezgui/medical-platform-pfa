package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medecin")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantM")
    private Integer identifiantM;

    @Column(name = "NomM")
    private String nomM;
    @Column(name = "PrenomM")
    private String prenomM;
    @Column(name = "DateNaissM")
    private LocalDate dateNaissM;
    @Column(name = "SexeM")
    private String sexeM;
    @Column(name = "NumTelM")
    private String numTelM;
    @Column(name = "NumTelWhapAPPM")
    private String numTelWhapAPPM;
    @Column(name = "AdresseDomM")
    private String adresseDomM;
    @Column(name = "SpecialiteM")
    private String specialiteM;
    @Column(name = "DateDernierDiplomeM")
    private LocalDate dateDernierDiplomeM;
    @Column(name = "IndexHopitalM")
    private String indexHopitalM;

    @Column(name = "AutreInfo", columnDefinition = "TEXT")
    private String autreInfo; 

    @Enumerated(EnumType.STRING)
    @Column(name = "TypeMedecin")
    private TypeMedecin typeMedecin; 

    // RELATIONS 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantS")
    private ServiceMedical service;

    @OneToMany(mappedBy = "medecin")
    @JsonIgnore
    private Set<ResponsableInvestigation> investigations = new HashSet<>();

    @ManyToMany(mappedBy = "medecinsSuivi")
    @JsonIgnore
    private Set<PatientIdAdmin> patientsSuivis = new HashSet<>();

    @OneToOne(mappedBy = "medecin")
    @JsonIgnore
    private User utilisateur;
}