package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "greffe")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Greffe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantG")
    private Integer identifiantG;

    @Column(name = "DateG")
    private LocalDate dateG;

    @Column(name = "DescriptionG", columnDefinition = "TEXT")
    private String descriptionG;

    @Column(name = "AutresObservationsG", columnDefinition = "TEXT")
    private String autresObservationsG;

    // RELATION
    @OneToMany(mappedBy = "greffe", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<BilanGreffe> bilans = new ArrayList<>();

    @ManyToMany(mappedBy = "greffes")
    @JsonIgnore
    private Set<NephropathieInitiale> nephropathies;
}