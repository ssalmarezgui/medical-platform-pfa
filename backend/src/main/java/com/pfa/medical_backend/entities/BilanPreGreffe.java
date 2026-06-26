package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bilan_pre_greffe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BilanPreGreffe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantB")
    private Integer identifiantB;

    @Column(name = "DateBilanB")
    private LocalDate dateBilanB;

    @Column(name = "DescriptionBilanB", columnDefinition = "TEXT") // Description générale
    private String descriptionBilanB;

    @Column(name = "ResultatBilanB", length = 512) // ex: "Apte à la greffe", "Contre-indication temporaire"
    private String resultatBilanB;

    @Column(name = "RapportBilanB", columnDefinition = "TEXT") // Compte-rendu détaillé des examens
    private String rapportBilanB;

    // --- RELATION CONFORME AUX CARDINALITÉS MCD ---
    // Un bilan pré-greffe est associé à une seule néphropathie initiale
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantNI", nullable = false)
    private NephropathieInitiale nephropathie;
}