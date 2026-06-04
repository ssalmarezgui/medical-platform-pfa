package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "dialyse")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Dialyse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantDia")
    private Integer identifiantDia;

    @Column(name = "TypeDialyse")
    private String typeDialyse;

    // Relation
    @ManyToMany(mappedBy = "dialyses")
    @JsonIgnore
    private Set<NephropathieInitiale> nephropathies = new HashSet<>();
}