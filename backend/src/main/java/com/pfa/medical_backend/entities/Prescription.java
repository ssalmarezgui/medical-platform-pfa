package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prescription")
@Data
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private java.time.LocalDate datePremierePrise;
    private String dosageMed;
    private java.time.LocalDate dateSortie;

    @ManyToOne 
    @JoinColumn(name = "IdentifiantTIS", nullable = false)
    private TraitementImmunoSuppresseur traitement;

    @ManyToOne 
    @JoinColumn(name = "IdentifiantMed", nullable = false)
    private Medicament medicament;

    @ManyToOne 
    @JoinColumn(name = "IdentifiantEffet")
    private EffetSecondaire effetSecondaire;
}
