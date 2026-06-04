package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "bilan_greffe")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BilanGreffe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantBG")
    private Integer identifiantBG;

    @Column(name = "DateBG")
    private LocalDate dateBG;

    @Column(name = "DescriptionBG", length = 256)
    private String descriptionBG;

    @Column(name = "ResultatBG", length = 256)
    private String resultatBG;

    @Lob //OLE (fichiers, images, rapports scannés)
    @Column(name = "RapportBilanBG")
    private byte[] rapportBilanBG;

    // Relation

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantG", nullable = false)
    @JsonBackReference
    private Greffe greffe;
}