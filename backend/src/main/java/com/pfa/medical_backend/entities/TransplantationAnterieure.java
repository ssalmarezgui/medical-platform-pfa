package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "transplantation_anterieure")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TransplantationAnterieure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantTR")
    private Integer identifiantTR;

    @Column(name = "DateTR")
    private LocalDate dateTR;

    @Column(name = "LieuTR", length = 256)
    private String lieuTR;

    @Column(name = "LieuSuiviTR", length = 256)
    private String lieuSuiviTR;

    @Column(name = "TypeDonneur", length = 256)
    private String typeDonneur;

    @Column(name = "HLADonneur", length = 256)
    private String hlaDonneur;

    @Column(name = "TraitementImmunoSuppresseurInduction", length = 512)
    private String traitementImmunoSuppresseurInduction;

    @Column(name = "TraitementImmunoSuppresseurEntretien", length = 512)
    private String traitementImmunoSuppresseurEntretien;

    @Column(name = "CausePerteGreffonRenale", length = 512)
    private String causePerteGreffonRenale;

    @Column(name = "DateRetourDialyse")
    private LocalDate dateRetourDialyse;

    @Column(name = "Transplantectomie")
    private Boolean transplantectomie;

    @Column(name = "TransplantectomieIndication", length = 256)
    private String transplantectomieIndication;

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;
}