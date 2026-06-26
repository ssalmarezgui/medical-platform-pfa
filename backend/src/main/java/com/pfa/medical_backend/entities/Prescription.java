package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "prescrire")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantPrescription")
    private Integer identifiantPrescription;

    @Column(name = "DatePremierePrise")
    private LocalDate datePremierePrise;

    @Column(name = "DosageMed", length = 256)
    private String dosageMed;

    @Column(name = "DateSortie")
    private LocalDate dateSortie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantTIS", nullable = false)
    private TraitementImmunoSuppresseur traitement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantMed", nullable = false)
    private Medicament medicament;
}