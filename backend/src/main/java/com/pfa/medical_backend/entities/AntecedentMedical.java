package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "antecedent_medical")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AntecedentMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAM")
    private Integer identifiantAM; 

    @Column(name = "DescriptionAM")
    private String descriptionAM;  

    // Relation 
    @ManyToMany(mappedBy = "antecedentsMedicaux")
    @JsonIgnore
    private Set<Comorbidite> comorbidites = new HashSet<>();
}