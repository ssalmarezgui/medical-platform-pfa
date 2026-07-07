package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class MicrobiologieSerologieService {

    private final MicrobiologieSerologieRepository msRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public MicrobiologieSerologieService(
        MicrobiologieSerologieRepository msRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.msRepository = msRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public Optional<MicrobiologieSerologie> getByPatient(String patientId) {
        return msRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<MicrobiologieSerologie> getByDonneur(Integer donorId) {
        return msRepository.findByDonneur_IdentifiantD(donorId);
    }

    @Transactional("transactionManager")
    public MicrobiologieSerologie createOrUpdate(String patientId, MicrobiologieSerologie incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<MicrobiologieSerologie> existing = msRepository.findByPatient_IdentifiantP(patientId);
        MicrobiologieSerologie ms;

        if (existing.isPresent()) {
            ms = existing.get();
            ms.setTypeMS(incoming.getTypeMS());
        } else {
            ms = new MicrobiologieSerologie();
            ms.setPatient(patient);
            ms.setTypeMS(incoming.getTypeMS());
        }

        if (incoming.getAnalyses() != null) {
            ms.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setMicrobiologieSerologie(ms);
                ana.setTypeAnalyse("INFECTIEUX");
                ms.getAnalyses().add(ana);
            }
        }

        return msRepository.save(ms);
    }

    @Transactional("transactionManager")
    public MicrobiologieSerologie createOrUpdateForDonor(Integer donorId, MicrobiologieSerologie incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<MicrobiologieSerologie> existing = msRepository.findByDonneur_IdentifiantD(donorId);
        MicrobiologieSerologie ms;

        if (existing.isPresent()) {
            ms = existing.get();
            ms.setTypeMS(incoming.getTypeMS());
        } else {
            ms = new MicrobiologieSerologie();
            ms.setDonneur(donneur);
            ms.setPatient(null);
            ms.setTypeMS(incoming.getTypeMS());
        }

        if (incoming.getAnalyses() != null) {
            ms.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setMicrobiologieSerologie(ms);
                ana.setTypeAnalyse("INFECTIEUX");
                ms.getAnalyses().add(ana);
            }
        }

        return msRepository.save(ms);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        MicrobiologieSerologie ms = msRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        msRepository.delete(ms);
    }
}