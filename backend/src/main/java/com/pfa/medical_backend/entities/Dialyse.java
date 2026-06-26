package com.pfa.medical_backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dialyse")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Dialyse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdentifiantDia")
    private Integer identifiantDia;

    @Column(name = "TypeDialyse", length = 256)
    private String typeDialyse;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdentifiantNI", nullable = false)
    private NephropathieInitiale nephropathie;
}