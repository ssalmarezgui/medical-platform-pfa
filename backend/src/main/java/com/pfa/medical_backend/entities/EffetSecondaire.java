package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "effet_secondaire")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EffetSecondaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantEFS")
    private Integer identifiantEFS; 

    @Column(name = "LibelleEFS")
    private String libelleEFS;

    @Column(name = "DescriptionEFS", columnDefinition = "TEXT")
    private String descriptionEFS;

    @Column(name = "RecommendationEFS", columnDefinition = "TEXT")
    private String recommendationEFS;

    // Relation
    @OneToMany(mappedBy = "effetSecondaire")
    @JsonIgnore
    private Set<Prescription> prescriptions = new HashSet<>();
}