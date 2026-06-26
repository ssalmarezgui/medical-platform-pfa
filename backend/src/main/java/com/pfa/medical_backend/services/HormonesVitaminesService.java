package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class HormonesVitaminesService {

    @Autowired
    private HormonesVitaminesRepository hvRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

    public Optional<HormonesVitamines> getByPatient(String patientId) {
        return hvRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<HormonesVitamines> getByDonneur(Integer donorId) {
        return hvRepository.findByDonneur_IdentifiantD(donorId);
    }


    @Transactional("transactionManager")
    public HormonesVitamines createOrUpdateForDonor(Integer donorId, HormonesVitamines incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<HormonesVitamines> existing = hvRepository.findByDonneur_IdentifiantD(donorId);
        HormonesVitamines hv;

        if (existing.isPresent()) {
            hv = existing.get();
            hv.setTypeHV(incoming.getTypeHV());
        } else {
            hv = new HormonesVitamines();
            hv.setDonneur(donneur);
            hv.setPatient(null);
            hv.setTypeHV(incoming.getTypeHV());
        }

        // On associe les analyses d'endocrinologie
        if (incoming.getAnalyses() != null) {
            hv.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setHormonesVitamines(hv);
                ana.setTypeAnalyse("HORMONES_VITAMINES");
                hv.getAnalyses().add(ana);
            }
        }

        return hvRepository.save(hv);
    }



    @Transactional("transactionManager")
    public HormonesVitamines createOrUpdate(String patientId, HormonesVitamines incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<HormonesVitamines> existing = hvRepository.findByPatient_IdentifiantP(patientId);
        HormonesVitamines hv;

        if (existing.isPresent()) {
            hv = existing.get();
            hv.setTypeHV(incoming.getTypeHV());
        } else {
            hv = new HormonesVitamines();
            hv.setPatient(patient);
            hv.setTypeHV(incoming.getTypeHV());
        }

        // On associe les analyses d'endocrinologie
        if (incoming.getAnalyses() != null) {
            hv.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setHormonesVitamines(hv);
                ana.setTypeAnalyse("HORMONES_VITAMINES");
                hv.getAnalyses().add(ana);
            }
        }

        return hvRepository.save(hv);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        HormonesVitamines hv = hvRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        hvRepository.delete(hv);
    }
}