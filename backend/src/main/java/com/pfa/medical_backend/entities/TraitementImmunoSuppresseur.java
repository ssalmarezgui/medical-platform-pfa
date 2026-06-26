package com.pfa.medical_backend.entities;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "traitement_immunosuppresseur")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Stratégie d'héritage
@DiscriminatorColumn(name = "type_tis", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "typeTIS"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = TISInduction.class, name = "INDUCTION"),
    @JsonSubTypes.Type(value = TISEntretien.class, name = "ENTRETIEN")
})
public abstract class TraitementImmunoSuppresseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantTIS")
    private Integer identifiantTIS;

    @Column(name = "DCITIS", length = 256)
    private String dciTIS;

    @Column(name = "DurerTraitementTIS", length = 256)
    private String durerTraitementTIS;

    // Relation Many-to-One vers le Patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;

    @OneToMany(mappedBy = "traitement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Évite les boucles de sérialisation infinie avec Jackson
    private List<DosageMedSang> dosages;

    @OneToMany(mappedBy = "traitement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Évite les boucles de sérialisation infinie avec Jackson
    private List<Prescription> prescriptions;
}