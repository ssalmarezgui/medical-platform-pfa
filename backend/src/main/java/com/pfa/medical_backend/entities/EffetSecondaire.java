package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "effet_secondaire")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EffetSecondaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantEFS")
    private Integer identifiantEFS;

    @Column(name = "LibelleEFS", length = 256)
    private String libelleEFS;

    @Column(name = "DescriptionEFS", columnDefinition = "TEXT")
    private String descriptionEFS;

    @Column(name = "RecommendationEFS", columnDefinition = "TEXT") 
    private String recommendationEFS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantPrescription", nullable = false)
    private Prescription prescription;
}