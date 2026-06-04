package com.pfa.medical_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bilan_greffe_donneur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BilanGreffeDonneur {

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

    @Lob
    @Column(name = "RapportBilanBG")
    private byte[] rapportBilanBG; 

    // Relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantD", nullable = false)
    private Donneur donneur;
}