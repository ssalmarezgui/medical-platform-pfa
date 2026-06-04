package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comorbidite")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Comorbidite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantC")
    private Integer identifiantC; 

    @Column(name = "Diabete")
    private Boolean diabete;     

    @Column(name = "Cardiaque")
    private Boolean cardiaque;   

    // Relations
    @ManyToMany(mappedBy = "comorbidites")
    @JsonIgnore
    private Set<PatientIdAdmin> patients = new HashSet<>();


    @ManyToMany
    @JoinTable(
        name = "disposer_cac",
        joinColumns = @JoinColumn(name = "IdentifiantC"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantAC")
    )
    private Set<AntecedentChirurgical> antecedentsChirurgicaux = new HashSet<>();

    
    @ManyToMany
    @JoinTable(
        name = "disposer_cam",
        joinColumns = @JoinColumn(name = "IdentifiantC"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantAM")
    )
    private Set<AntecedentMedical> antecedentsMedicaux = new HashSet<>();
}