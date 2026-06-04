package com.pfa.medical_backend.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;



@Entity
@Table(name = "patient_idadmin")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientIdAdmin {
    @Id
    @Column(name = "IdentifiantP")
    private String identifiantP;

    @Column(name = "IndexHopitalP")
    private String indexHopitalP;

    @Column(name = "NomP")
    private String nomP;

    @Column(name = "PrenomP")
    private String prenomP;

    @Column(name = "NationaliteP")
    private String nationaliteP;

    @Column(name = "SexeP")
    private String sexeP;

    @Column(name = "OrigineGeogP")
    private String origineGeogP;

    @Column(name = "ADRESSEDOMP")
    private String adresseP;

    @Column(name = "TelephoneP")
    private String telephoneP;

    @Column(name = "AdressEmailP")
    private String adressEmailP;

    @Column(name = "TelephoneWhatsAppP")
    private String telephoneWhatsAppP;

    @Column(name = "DateNaissanceP")
    private LocalDate dateNaissP;

    @Column(name = "PersonneAcontacterP")
    private String personneAcontacterP;

    @Column(name = "TypeCarnetP")
    private String typeCarnetP;

    @Column(name = "NumCarnetP")
    private String numCarnetP;

    @Column(name = "AdulteP")
    private Boolean adulteP;

    @Column(name = "NUMEROCIN")
    private Integer numeroCin;

    @Column(name = "STATUT")
    private String statut;

    @Column(name = "EVOLUTION")
    private String evolution;

    @Column(name = "NIVEAU_EDUCATION")
    private String niveauEducation;

    @Column(name = "EN_ETAT_ACTIVITE")
    private Boolean enEtatActivite;


    // Realtions

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Medecin_Investigateur")
    private Medecin medecinInvestigateur;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private Set<ResponsableInvestigation> responsables;

    @ManyToMany
    @JoinTable(
        name = "patient_nephropathie",
        joinColumns = @JoinColumn(name = "IdentifiantP"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantNI")
    )
    private Set<NephropathieInitiale> nephropathies = new HashSet<>();

    // Relation Trinaire [Greffer] (Patient - Donneur - Transplantation)
    @OneToMany(mappedBy = "patient")
    @JsonIgnore
    private Set<Transplantation> transplantations = new HashSet<>();


    @ManyToMany
    @JoinTable(
        name = "patient_comorbidite",
        joinColumns = @JoinColumn(name = "IdentifiantP"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantC")
    )
    private Set<Comorbidite> comorbidites = new HashSet<>();


    @OneToMany(mappedBy = "patient")
    @JsonIgnore
    private Set<TraitementImmunoSuppresseur> traitements = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<AffectationPatientService> affectations = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "patient_suivi_medecin",
        joinColumns = @JoinColumn(name = "IdentifiantP"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantM")
    )
    private Set<Medecin> medecinsSuivi = new HashSet<>();

}
