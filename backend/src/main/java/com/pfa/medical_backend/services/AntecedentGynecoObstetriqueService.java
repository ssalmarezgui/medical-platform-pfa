package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.AntecedentGynecoObstetrique;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.AntecedentGynecoObstetriqueRepository;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class AntecedentGynecoObstetriqueService {

    @Autowired
    private AntecedentGynecoObstetriqueRepository agoRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

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
        // Sécurité : On s'assure que la patiente n'a pas déjà un dossier d'antécédents gynéco
        Optional<AntecedentGynecoObstetrique> existing = agoRepository.findByPatient_IdentifiantP(patientId);
        if (existing.isPresent()) {
            throw new RuntimeException("Erreur : Un dossier gynéco existe déjà pour cette patiente.");
        }

        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patiente non trouvée"));
        
        // Sécurité clinique : Seule une femme peut avoir un dossier gynécologique
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
            throw new RuntimeException("Erreur : Un dossier gynéco existe déjà pour ce donneur.");
        }

        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        
        // Contrôle de sécurité clinique de genre sur le donneur
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
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

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

    // Ouvre ton AntecedentGynecoObstetriqueService.java et modifie la méthode delete :

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Optional<AntecedentGynecoObstetrique> optAgo = agoRepository.findById(id);
        
        if (optAgo.isPresent()) {
            AntecedentGynecoObstetrique ago = optAgo.get();
            
            // Suppression directe de l'antécédent en base SQL
            agoRepository.delete(ago);
        }
    }
}