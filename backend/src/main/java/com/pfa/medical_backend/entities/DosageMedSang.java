package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "dosage_med_sang")
@Data
public class DosageMedSang {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private java.time.LocalDateTime dateDMS;
    private String labelDMS;
    private String valeurDMS;
    private String observationDMS;

    @ManyToOne @JoinColumn(name = "IdentifiantTIS")
    private TraitementImmunoSuppresseur traitement;

    @ManyToOne @JoinColumn(name = "IdentifiantMed")
    private Medicament medicament;
}
