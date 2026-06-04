package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class SuiviMedicalService {

    @Autowired private PrescriptionRepository prescriptionRepo;
    @Autowired private DosageMedSangRepository dosageRepo;
    @Autowired private BilanGreffeRepository bilanRepo;
    @Autowired private TraitementImmunoSuppresseurRepository tisRepo;


    @Transactional("transactionManager")
    public Prescription ajouterPrescription(Prescription p, Integer tisId) {
        TraitementImmunoSuppresseur tis = tisRepo.findById(tisId)
            .orElseThrow(() -> new RuntimeException("Traitement TIS introuvable"));
        p.setTraitement(tis);
        log.info("Nouvelle prescription pour le traitement ID: {}", tisId);
        return prescriptionRepo.save(p);
    }

    public List<Prescription> getPrescriptionsParPatient(String patientId) {
        return prescriptionRepo.findByTraitement_Patient_IdentifiantP(patientId);
    }


    @Transactional("transactionManager")
    public DosageMedSang enregistrerAnalyseSang(DosageMedSang dosage, Integer tisId) {
        TraitementImmunoSuppresseur tis = tisRepo.findById(tisId).orElseThrow();
        dosage.setTraitement(tis);
        log.info("Nouveau dosage sanguin enregistré par le laboratoire pour TIS: {}", tisId);
        return dosageRepo.save(dosage);
    }

    public List<DosageMedSang> getHistoriqueDosages(String patientId) {
        return dosageRepo.findByTraitement_Patient_IdentifiantP(patientId);
    }


    public List<BilanGreffe> getBilansParPatient(String patientId) {
        return bilanRepo.findByPatient_IdentifiantP(patientId);
    }
}