package com.pfa.medical_backend.entities;

import jakarta.persistence.*;

import lombok.Data;

import java.time.LocalDate;


@Entity
@Table(name = "responsable_investigation") 
@Data
public class ResponsableInvestigation {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Responsable") 
    private Integer id;
    
    @Column(name = "DateDebut", nullable = false)
    private LocalDate dateDebut;

    @ManyToOne 
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;

    @ManyToOne 
    @JoinColumn(name = "IdentifiantM", nullable = false)
    private Medecin medecin;
}