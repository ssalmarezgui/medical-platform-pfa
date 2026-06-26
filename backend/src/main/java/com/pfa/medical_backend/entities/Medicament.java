package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicament")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantMed")
    private Integer identifiantMed;

    @Column(name = "NomCommercialMed", length = 256)
    private String nomCommercialMed;

    @Column(name = "DescriptionMed", columnDefinition = "TEXT")
    private String descriptionMed;

    @Column(name = "TypeMed", length = 256)
    private String typeMed;

    @Column(name = "PosologieMed", length = 256)
    private String posologieMed;

    @ManyToMany
    @JoinTable(
        name = "interaction_medicament",
        joinColumns = @JoinColumn(name = "IdentifiantMed_1"),
        inverseJoinColumns = @JoinColumn(name = "IdentifiantMed_2")
    )
    @JsonIgnore
    private Set<Medicament> interactionsSource = new HashSet<>();

    @ManyToMany(mappedBy = "interactionsSource")
    @JsonIgnore
    private Set<Medicament> interactionsCible = new HashSet<>();
}