package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class FicheHematologieService {

    private final HemotologieHemostaseRepository hhRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public FicheHematologieService(
        HemotologieHemostaseRepository hhRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.hhRepository = hhRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public Optional<HemotologieHemostase> getByPatient(String patientId) {
        return hhRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<HemotologieHemostase> getByDonneur(Integer donorId) {
        return hhRepository.findByDonneur_IdentifiantD(donorId);
    }

    @Transactional("transactionManager")
    public HemotologieHemostase createOrUpdate(String patientId, HemotologieHemostase incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<HemotologieHemostase> existing = hhRepository.findByPatient_IdentifiantP(patientId);
        HemotologieHemostase hh;

        if (existing.isPresent()) {
            hh = existing.get();
            hh.setGroupeSanguin(incoming.getGroupeSanguin());
            hh.setPhenotypage(incoming.getPhenotypage());
        } else {
            hh = new HemotologieHemostase();
            hh.setPatient(patient);
            hh.setGroupeSanguin(incoming.getGroupeSanguin());
            hh.setPhenotypage(incoming.getPhenotypage());
        }

        if (incoming.getAnalyses() != null) {
            hh.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setHematologie(hh);
                ana.setTypeAnalyse("HEMATOLOGIE");
                hh.getAnalyses().add(ana);
            }
        }

        return hhRepository.save(hh);
    }

    @Transactional("transactionManager")
    public HemotologieHemostase createOrUpdateForDonor(Integer donorId, HemotologieHemostase incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<HemotologieHemostase> existing = hhRepository.findByDonneur_IdentifiantD(donorId);
        HemotologieHemostase hh;

        if (existing.isPresent()) {
            hh = existing.get();
            hh.setGroupeSanguin(incoming.getGroupeSanguin());
            hh.setPhenotypage(incoming.getPhenotypage());
        } else {
            hh = new HemotologieHemostase();
            hh.setDonneur(donneur);
            hh.setPatient(null);
            hh.setGroupeSanguin(incoming.getGroupeSanguin());
            hh.setPhenotypage(incoming.getPhenotypage());
        }

        if (incoming.getAnalyses() != null) {
            hh.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setHematologie(hh);
                ana.setTypeAnalyse("HEMATOLOGIE");
                hh.getAnalyses().add(ana);
            }
        }

        return hhRepository.save(hh);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        HemotologieHemostase hh = hhRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        hhRepository.delete(hh);
    }
}