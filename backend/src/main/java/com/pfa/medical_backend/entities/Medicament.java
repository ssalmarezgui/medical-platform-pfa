package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicament")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantMed")
    private Integer identifiantMed;

    @Column(name = "NomCommercialMed")
    private String nomCommercialMed;

    @Column(name = "DescriptionMed", columnDefinition = "TEXT")
    private String descriptionMed; 

    @Column(name = "TypeMed")
    private String typeMed;

    @Column(name = "PosologieMed")
    private String posologieMed;
    

    // RELATION

    @ManyToMany
    @JoinTable(
        name = "medicament_interactions",
        joinColumns = @JoinColumn(name = "IdentifiantMed_Source"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantMed_Cible")
    )
    @JsonIgnore
    private Set<Medicament> interactions = new HashSet<>();

    @OneToMany(mappedBy = "medicament")
    @JsonIgnore
    private Set<Prescription> prescriptions = new HashSet<>();
    
    @OneToMany(mappedBy = "medicament")
    @JsonIgnore
    private Set<DosageMedSang> dosages = new HashSet<>();
}