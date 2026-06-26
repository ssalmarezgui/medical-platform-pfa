package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parametres_biopsiques")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParametresBiopsiques {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantPB")
    private Integer identifiantPB;

    // --- RELATION CONFORME AUX CARDINALITÉS MCD ---
    // Les paramètres de biopsie appartiennent à une néphropathie initiale d'origine de patient
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantNI", nullable = false, unique = true) // Liaison unique
    private NephropathieInitiale nephropathie;
}