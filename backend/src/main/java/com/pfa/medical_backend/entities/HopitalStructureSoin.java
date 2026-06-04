package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;



import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.util.Set;
import java.time.LocalDate;
import java.util.HashSet;



@Entity
@Table(name = "hopital_structuresoin")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HopitalStructureSoin {

    @Id 
    @Size(min = 10, max = 10, message = "Le code hôpital doit faire exactement 10 caractères")
    @Column(name= "IdentifiantH", length = 10)
    private String identifiantH;

    @Column(name="LibelleH")
    private String libelleH;

    @Column(name="AdresseH")
    private String adresseH;

    @Column(name="NbBlocH")
    private Integer nbBlocH;

    @Column(name="NbServiceH")
    private Integer nbServiceH;

    @Column(name="NbLitsH")
    private Integer nbLitsH;

    @Column(name="DescriptionH", columnDefinition = "TEXT")
    private String descriptionH;

    @Column(name="DateCreationH")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateCreationH;


    // Relation 
    @OneToMany(mappedBy = "hopital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // chaque hopital peut avoir plusieurs services
    @ToString.Exclude 
    @JsonIgnore
    private Set<ServiceMedical> services = new HashSet<>();
    
}
