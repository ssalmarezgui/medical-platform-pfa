package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "transplantation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transplantation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NumeroTR")
    private Integer numeroTR;

    @Column(name = "DateTR")
    private LocalDate dateTR;

    @Column(name = "LieuDeLaGreffe", length = 256)
    private String lieuDeLaGreffe;

    @Column(name = "LieuDeSuivi", length = 256)
    private String lieuDeSuivi;

    @Column(name = "NbTransplantation")
    private Integer nbTransplantation;

    @Column(name = "NbUretere")
    private Integer nbUretere;

    @Column(name = "Rein", length = 64)
    private String rein;

    @Column(name = "NbArtereVeine")
    private Integer nbArtereVeine;

    @Column(name = "Kystes")
    private Boolean kystes;

    @Column(name = "TypeAnomalie", length = 256)
    private String typeAnomalie;

    @Column(name = "DureeIschemieFroide")
    private Integer dureeIschemieFroide;

    @Column(name = "DureeIschemieChaude")
    private Integer dureeIschemieChaude;

    @Column(name = "LiquideConservation", length = 256)
    private String liquideConservation;

    @Column(name = "LiquideRincage", length = 256)
    private String liquideRincage;

    @Column(name = "MachineAPerfusion")
    private Boolean machineAPerfusion;

    @Column(name = "TypeAnastomoseArterielle", length = 256)
    private String typeAnastomoseArterielle;

    @Column(name = "TypeAnastomoseVeineuse", length = 256)
    private String typeAnastomoseVeineuse;

    @Column(name = "TypeAnastomoseUreteroVesicale", length = 256)
    private String typeAnastomoseUreteroVesicale;

    @Column(name = "SondeEnDoubleJJ")
    private Boolean sondeEnDoubleJJ;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantP", nullable = false)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = false)
    private Donneur donneur;
}