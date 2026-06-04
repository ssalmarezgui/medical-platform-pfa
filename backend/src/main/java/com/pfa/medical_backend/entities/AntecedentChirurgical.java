package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "antecedent_chirurgical")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AntecedentChirurgical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantAC")
    private Integer identifiantAC; 

    @Column(name = "Description")
    private String description;  

    // Relation
    @ManyToMany(mappedBy = "antecedentsChirurgicaux")
    @JsonIgnore
    private Set<Comorbidite> comorbidites = new HashSet<>();
}