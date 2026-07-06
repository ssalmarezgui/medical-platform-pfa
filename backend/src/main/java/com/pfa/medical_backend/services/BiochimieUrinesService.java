package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class BiochimieUrinesService {

    private final BiochimieUrinesRepository buRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public BiochimieUrinesService(
        BiochimieUrinesRepository buRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.buRepository = buRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public Optional<BiochimieUrines> getByPatient(String patientId) {
        return buRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<BiochimieUrines> getByDonneur(Integer donorId) {
        return buRepository.findByDonneur_IdentifiantD(donorId);
    }

    @Transactional("transactionManager")
    public BiochimieUrines createOrUpdate(String patientId, BiochimieUrines incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<BiochimieUrines> existing = buRepository.findByPatient_IdentifiantP(patientId);
        BiochimieUrines bu;

        if (existing.isPresent()) {
            bu = existing.get();
            bu.setLibelleBUF(incoming.getLibelleBUF());
            bu.setDescriptionBUF(incoming.getDescriptionBUF());
        } else {
            bu = new BiochimieUrines();
            bu.setPatient(patient);
            bu.setLibelleBUF(incoming.getLibelleBUF());
            bu.setDescriptionBUF(incoming.getDescriptionBUF());
        }

        if (incoming.getAnalyses() != null) {
            bu.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBiochimieUrines(bu);
                ana.setTypeAnalyse("BIOCHIMIE_URINE");
                bu.getAnalyses().add(ana);
            }
        }

        return buRepository.save(bu);
    }

    @Transactional("transactionManager")
    public BiochimieUrines createOrUpdateForDonor(Integer donorId, BiochimieUrines incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<BiochimieUrines> existing = buRepository.findByDonneur_IdentifiantD(donorId);
        BiochimieUrines bu;

        if (existing.isPresent()) {
            bu = existing.get();
            bu.setLibelleBUF(incoming.getLibelleBUF());
            bu.setDescriptionBUF(incoming.getDescriptionBUF());
        } else {
            bu = new BiochimieUrines();
            bu.setDonneur(donneur);
            bu.setPatient(null);
            bu.setLibelleBUF(incoming.getLibelleBUF());
            bu.setDescriptionBUF(incoming.getDescriptionBUF());
        }

        if (incoming.getAnalyses() != null) {
            bu.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBiochimieUrines(bu);
                ana.setTypeAnalyse("BIOCHIMIE_URINE");
                bu.getAnalyses().add(ana);
            }
        }

        return buRepository.save(bu);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        BiochimieUrines bu = buRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        buRepository.delete(bu);
    }
}