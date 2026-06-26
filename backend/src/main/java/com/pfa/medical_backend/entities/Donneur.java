package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "donneur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Donneur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantD")
    private Integer identifiantD;

    @Column(name = "NomD")
    private String nomD;

    @Column(name = "PrenomD")
    private String prenomD;

    @Column(name = "NationaliteD")
    private String nationaliteD;

    @Column(name = "SexeD")
    private String sexeD;

    @Column(name = "OrigineGeogD")
    private String origineGeogD;

    @Column(name = "AdresseDomD")
    private String adresseDomD;

    @Column(name = "TelephoneD")
    private String telephoneD;

    @Column(name = "AdresseEmailD")
    private String adresseEmailD;

    @Column(name = "TelephoneWhatsAppD")
    private String telephoneWhatsAppD;

    @Column(name = "DateNaissD")
    private LocalDate dateNaissD; 

    @Column(name = "PersonneAcontacterD")
    private String personneAcontacterD;

    @Column(name = "TypeCarnetD")
    private String typeCarnetD;

    @Column(name = "NumCarnetD")
    private String numCarnetD;

    @Column(name = "IndexHopitalD")
    private String indexHopitalD;

    @Column(name = "AdulteD")
    private Boolean adulteD; 

    @Column(name = "CIND")
    private String cinD;

    @Column(name = "Statut")
    private String statut;

    @Column(name = "EvolutionProf")
    private String evolutionProf;

    @Column(name = "NiveauEducation")
    private String niveauEducation;

    @Column(name = "EnEtatActivite")
    private Boolean enEtatActivite;

    @Column(name = "TypeDonneur")
    private String typeDonneur; 

    // RELATIONS

    @ManyToMany
    @JoinTable(
        name = "donneur_inscrit_service",
        joinColumns = @JoinColumn(name = "IdentifiantD"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantS")
    )
    private Set<ServiceMedical> servicesInscrits = new HashSet<>();

    @OneToMany(mappedBy = "donneur", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<BilanGreffeDonneur> bilans;

    @OneToMany(mappedBy = "donneur")
    @JsonIgnore
    private Set<Transplantation> transplantations;
}