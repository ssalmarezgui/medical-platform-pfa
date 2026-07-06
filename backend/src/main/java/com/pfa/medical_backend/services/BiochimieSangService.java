package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class BiochimieSangService {

    private final BiochimieSangRepository bsRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public BiochimieSangService(
        BiochimieSangRepository bsRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.bsRepository = bsRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public Optional<BiochimieSang> getByPatient(String patientId) {
        return bsRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<BiochimieSang> getByDonneur(Integer donorId) {
        return bsRepository.findByDonneur_IdentifiantD(donorId);
    }

    @Transactional("transactionManager")
    public BiochimieSang createOrUpdate(String patientId, BiochimieSang incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<BiochimieSang> existing = bsRepository.findByPatient_IdentifiantP(patientId);
        BiochimieSang bs;

        if (existing.isPresent()) {
            bs = existing.get();
            bs.setLibelleBCS(incoming.getLibelleBCS());
            bs.setDescriptionBCS(incoming.getDescriptionBCS());
        } else {
            bs = new BiochimieSang();
            bs.setPatient(patient);
            bs.setLibelleBCS(incoming.getLibelleBCS());
            bs.setDescriptionBCS(incoming.getDescriptionBCS());
        }

        if (incoming.getAnalyses() != null) {
            bs.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBiochimieSang(bs);
                ana.setTypeAnalyse("BIOCHIMIE_SANG");
                bs.getAnalyses().add(ana);
            }
        }

        return bsRepository.save(bs);
    }

    @Transactional("transactionManager")
    public BiochimieSang createOrUpdateForDonor(Integer donorId, BiochimieSang incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<BiochimieSang> existing = bsRepository.findByDonneur_IdentifiantD(donorId);
        BiochimieSang bs;

        if (existing.isPresent()) {
            bs = existing.get();
            bs.setLibelleBCS(incoming.getLibelleBCS());
            bs.setDescriptionBCS(incoming.getDescriptionBCS());
        } else {
            bs = new BiochimieSang();
            bs.setDonneur(donneur);
            bs.setPatient(null);
            bs.setLibelleBCS(incoming.getLibelleBCS());
            bs.setDescriptionBCS(incoming.getDescriptionBCS());
        }

        if (incoming.getAnalyses() != null) {
            bs.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBiochimieSang(bs);
                ana.setTypeAnalyse("BIOCHIMIE_SANG");
                bs.getAnalyses().add(ana);
            }
        }

        return bsRepository.save(bs);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        BiochimieSang bs = bsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        bsRepository.delete(bs);
    }
}