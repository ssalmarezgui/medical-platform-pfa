package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "utilisateurs") 
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantU")
    private Integer identifiantU;

    @Column(name = "LoginU", unique = true, nullable = false)
    private String loginU;

    @Column(name = "MotPasseU", nullable = false)
    @JsonIgnore // Ne pas exposer le mot de passe dans les réponses JSON
    private String motPasseU; 

    @Column(name = "RoleU")
    private String roleU;      

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantS", nullable = false)
    @JsonIgnoreProperties("users") 
    private ServiceMedical service;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantM", nullable = true)
    private Medecin medecin;

}