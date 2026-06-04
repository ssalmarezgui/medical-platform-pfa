package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "bilan_pre_greffe_ni")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BilanPreGreffeNI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantB")
    private Integer identifiantB; 

    @Column(name = "DateBilanB")
    private LocalDate dateBilanB;

    @Column(name = "DescriptionBilanB")
    private String descriptionBilanB;

    @Column(name = "ResultatBilanB")
    private String resultatBilanB;

    @Lob
    @Column(name = "RapportBilanB")
    private byte[] rapportBilanB;

    // Relation
    @OneToMany(mappedBy = "bilanPreGreffe")
    @JsonIgnore
    private Set<NephropathieInitiale> nephropathies;
}