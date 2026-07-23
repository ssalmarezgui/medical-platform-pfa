package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.AntecedentGynecoObstetrique;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.AntecedentGynecoObstetriqueRepository;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AntecedentGynecoObstetriqueService {

    private final AntecedentGynecoObstetriqueRepository agoRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public Optional<AntecedentGynecoObstetrique> getByPatient(String patientId) {
        return agoRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<AntecedentGynecoObstetrique> getByDonneur(Integer donorId) {
        return agoRepository.findByDonneur_IdentifiantD(donorId);
    }

    public Optional<AntecedentGynecoObstetrique> getById(Integer id) {
        return agoRepository.findById(id);
    }

    @Transactional("transactionManager")
    public AntecedentGynecoObstetrique create(AntecedentGynecoObstetrique ago, String patientId) {
        Optional<AntecedentGynecoObstetrique> existing = agoRepository.findByPatient_IdentifiantP(patientId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Erreur : Un dossier gynéco existe déjà pour cette patiente.");
        }

        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new EntityNotFoundException("Patiente non trouvée"));
        
        if (!"F".equalsIgnoreCase(patient.getSexeP())) {
            throw new IllegalArgumentException("Erreur clinique : Ce dossier ne s'applique qu'aux patientes de sexe féminin.");
        }

        ago.setPatient(patient);
        return agoRepository.save(ago);
    }

    @Transactional("transactionManager")
    public AntecedentGynecoObstetrique createForDonor(AntecedentGynecoObstetrique ago, Integer donorId) {
        Optional<AntecedentGynecoObstetrique> existing = agoRepository.findByDonneur_IdentifiantD(donorId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Erreur : Un dossier gynéco existe déjà pour ce donneur.");
        }

        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new EntityNotFoundException("Donneur non trouvé"));
        
        if (!"F".equalsIgnoreCase(donneur.getSexeD())) {
            throw new IllegalArgumentException("Erreur clinique : Ce dossier ne s'applique qu'aux donneuses de sexe féminin.");
        }

        ago.setDonneur(donneur);
        ago.setPatient(null);
        return agoRepository.save(ago);
    }

    @Transactional("transactionManager")
    public AntecedentGynecoObstetrique update(Integer id, AntecedentGynecoObstetrique details) {
        AntecedentGynecoObstetrique ago = agoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Dossier non trouvé"));

        if (details.getDatePremieresRegles() != null) ago.setDatePremieresRegles(details.getDatePremieresRegles());
        if (details.getMenopause() != null) ago.setMenopause(details.getMenopause());
        if (details.getGrossessesNombreTotal() != null) ago.setGrossessesNombreTotal(details.getGrossessesNombreTotal());
        if (details.getGrossessesAvortementsProvoques() != null) ago.setGrossessesAvortementsProvoques(details.getGrossessesAvortementsProvoques());
        if (details.getGrossessesPreeclampsie() != null) ago.setGrossessesPreeclampsie(details.getGrossessesPreeclampsie());
        if (details.getGrossessesAccouchementsPrematures() != null) ago.setGrossessesAccouchementsPrematures(details.getGrossessesAccouchementsPrematures());
        if (details.getGrossessesAvortementsSpontanes() != null) ago.setGrossessesAvortementsSpontanes(details.getGrossessesAvortementsSpontanes());
        if (details.getGrossessesCesarienne() != null) ago.setGrossessesCesarienne(details.getGrossessesCesarienne());
        if (details.getContraceptionMethodes() != null) ago.setContraceptionMethodes(details.getContraceptionMethodes());
        if (details.getContraceptionDuree() != null) ago.setContraceptionDuree(details.getContraceptionDuree());
        if (details.getPathologieMammaireGyneco() != null) ago.setPathologieMammaireGyneco(details.getPathologieMammaireGyneco());

        return agoRepository.save(ago);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Optional<AntecedentGynecoObstetrique> optAgo = agoRepository.findById(id);
        
        if (optAgo.isPresent()) {
            AntecedentGynecoObstetrique ago = optAgo.get();
            agoRepository.delete(ago);
        }
    }
}