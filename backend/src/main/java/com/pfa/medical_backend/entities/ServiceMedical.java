package com.pfa.medical_backend.entities;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;



@Entity
@Table(name = "service")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceMedical {


    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="IdentifiantS")
    private Integer identifiantS;

    @Column(name="LibelleS")
    private String libelleS;

    @Column(name="NbLitsS")
    private Integer nbLitsS;

    @Column(name="NbChambresS")
    private Integer nbChambresS;

    @Column(name="NbMedecinsS")
    private Integer nbMedecinsS;

    @Column(name="IdentifiantH", insertable = false, updatable = false) 
    // insertable = false, updatable = false : pour indiquer que cette colonne est gérée par la relation et ne doit pas être modifiée directement
    private String idHopital;


    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantH", nullable = false)
    private HopitalStructureSoin hopital;


    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY) 
    @ToString.Exclude
    @JsonIgnore
    private Set<User> users = new HashSet<>();


    @ManyToMany(mappedBy = "servicesInscrits")
    @JsonIgnore
    private Set<Donneur> donneursInscrits = new HashSet<>();

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<AffectationPatientService> affectationsPatients = new HashSet<>();

    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private Set<Medecin> medecins = new HashSet<>();
    
}
