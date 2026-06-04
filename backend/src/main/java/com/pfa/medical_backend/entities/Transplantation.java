package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "transplantation")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transplantation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NUMEROTR")
    private Integer numeroTr;

    @Column(name = "DATETR")
    private LocalDate dateTr;

    @Column(name = "LIEUDELAGREFFE")
    private String lieuDeLaGreffe;

    @Column(name = "LIEUDESUIVI")
    private String lieuDeSuivi;

    @Column(name = "NBTRANSPLANTATION")
    private String nbTransplantation;


    @Column(name = "NBURETRE")
    private String nbUretre;

    @Column(name = "REIN")
    private String rein; 

    @Column(name = "NBARTERES_VEINES")
    private String nbArteresVeines;

    @Column(name = "KYSTES")
    private Boolean kystes;

    @Column(name = "DUREEDYSCHESIE")
    private String dureeDyschesie;

    @Column(name = "DUREEDYSCHESIECHAUDE")
    private String dureeDyschesieChaude;

    @Column(name = "LIQUIDEDECONSERVATION")
    private String liquideDeConservation;

    @Column(name = "LIQUIDEDERINCAGE")
    private String liquideDeRincage;

    @Column(name = "MACHINEAPERFUSION")
    private Boolean machineAPerfusion;

    @Column(name = "TYPEANASTOMOSEARTERIELLE")
    private String typeAnastomoseArterielle;

    @Column(name = "TYPEANASTOMOSEVEINEUSE")
    private String typeAnastomoseVeineuse;

    @Column(name = "TYPEANASTOMOSEURETEROVESICALE")
    private String typeAnastomoseUreteroVesicale;

    @Column(name = "SONDEENDOUBLEJ")
    private Boolean sondeEnDoubleJ;

    // Relations 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IDENTIFIANTP", nullable = false)
    private PatientIdAdmin patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IDENTIFIANTD", nullable = false)
    private Donneur donneur;
    
    @Column(name = "REJET_AIGU_1ERE_ANNEE")
    private Boolean rejetAigu1ereAnnee;

    @Column(name = "VIVANT_GREFFON")
    private Boolean vivantGreffon;
}