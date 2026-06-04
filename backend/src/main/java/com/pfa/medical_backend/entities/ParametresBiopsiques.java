package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "parametres_biopsiques")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ParametresBiopsiques {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantPB")
    private Integer identifiantPB;


    // Relation
    @OneToMany(mappedBy = "parametresBiopsiques")
    @JsonIgnore
    private Set<NephropathieInitiale> nephropathies;
}