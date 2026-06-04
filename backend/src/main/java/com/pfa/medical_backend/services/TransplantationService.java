package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class TransplantationService {

    @Autowired private TransplantationRepository transplantationRepo;
    @Autowired private PatientIdAdminRepository patientRepo;
    @Autowired private DonneurRepository donneurRepo;

    @Transactional("transactionManager")
    public Transplantation enregistrerGreffe(Transplantation trans, String patientId, Integer donneurId) {
        PatientIdAdmin patient = patientRepo.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient introuvable (ID: " + patientId + ")"));
            
        Donneur donneur = donneurRepo.findById(donneurId)
            .orElseThrow(() -> new RuntimeException("Donneur introuvable (ID: " + donneurId + ")"));

        trans.setPatient(patient);
        trans.setDonneur(donneur);
        
        log.info("Nouvelle transplantation enregistrée : Patient {} <-> Donneur {}", patientId, donneurId);
        return transplantationRepo.save(trans);
    }


    public List<Transplantation> getAll() {
        return transplantationRepo.findAll();
    }


    public Optional<Transplantation> getById(Integer id) {
        return transplantationRepo.findById(id);
    }


    public List<Transplantation> getByPatient(String patientId) {
        return transplantationRepo.findByPatient_IdentifiantP(patientId);
    }


    @Transactional("transactionManager")
    public Transplantation update(Integer id, Transplantation details) {
        Transplantation existing = transplantationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Acte de transplantation introuvable"));

        if (details.getRein() != null) existing.setRein(details.getRein());
        if (details.getLieuDeLaGreffe() != null) existing.setLieuDeLaGreffe(details.getLieuDeLaGreffe());
        if (details.getSondeEnDoubleJ() != null) existing.setSondeEnDoubleJ(details.getSondeEnDoubleJ());
        if (details.getRejetAigu1ereAnnee() != null) existing.setRejetAigu1ereAnnee(details.getRejetAigu1ereAnnee());
        
        log.info("Mise à jour de la transplantation ID: {}", id);
        return transplantationRepo.save(existing);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        if (!transplantationRepo.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Acte introuvable");
        }
        transplantationRepo.deleteById(id);
        log.warn("L'acte de transplantation ID: {} a été supprimé de la base.", id);
    }
}