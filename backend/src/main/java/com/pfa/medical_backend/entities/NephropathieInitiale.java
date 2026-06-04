package com.pfa.medical_backend.entities;

import jakarta.persistence.*;

import lombok.*;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "nephropathie_initiale")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class NephropathieInitiale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantNI")
    private Integer identifiantNI; 

    @Column(name = "TypeCliniqueNI")
    private String typeCliniqueNI; 

    @Column(name = "CauseNI")
    private String causeNI;       

    @Column(name = "TypeHistologiqueNI")
    private String typeHistologiqueNI;

    @Column(name = "StadeMaladieNI")
    private String stadeMaladieNI;  
    
    // Relation 
    @ManyToMany
    @JoinTable(
        name = "nephro_engendre_greffe",
        joinColumns = @JoinColumn(name = "IdentifiantNI"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantG")
    )
    private Set<Greffe> greffes = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "dialyse_conduit_nephro",
        joinColumns = @JoinColumn(name = "IdentifiantNI"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantD")
    )
    private Set<Dialyse> dialyses = new HashSet<>();


    @ManyToMany(mappedBy = "nephropathies")
    @JsonIgnore
    private Set<PatientIdAdmin> patients = new HashSet<>();
    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantB", nullable = false)
    private BilanPreGreffeNI bilanPreGreffe;

    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantPB", nullable = false)
    private ParametresBiopsiques parametresBiopsiques;

}