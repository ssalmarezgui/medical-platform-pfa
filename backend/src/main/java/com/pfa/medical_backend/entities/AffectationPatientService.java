package com.pfa.medical_backend.entities;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "affectation_patient_service")
@Data
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class AffectationPatientService {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate dateAffectation;
    
    private LocalDate dateSortie;

    @ManyToOne @JoinColumn(name = "IdentifiantP")
    private PatientIdAdmin patient;

    @ManyToOne @JoinColumn(name = "IdentifiantS")
    private ServiceMedical service;

    public AffectationPatientService(PatientIdAdmin patient, ServiceMedical service) {
        this.patient = patient;
        this.service = service;
        this.dateAffectation = LocalDate.now();
    }
}
