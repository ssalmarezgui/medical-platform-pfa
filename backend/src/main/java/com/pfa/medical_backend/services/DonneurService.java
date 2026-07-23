package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.repositories.DonneurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DonneurService {

    private final DonneurRepository donneurRepo;

    public List<Donneur> getAll(String hopitalId) {
        if (hopitalId == null || hopitalId.trim().isEmpty()) {
            return donneurRepo.findAll();
        }

        return donneurRepo.findByIndexHopitalD(hopitalId);
    }

    public Optional<Donneur> getById(Integer id) {
        return donneurRepo.findById(id);
    }

    public List<Donneur> getByType(String type) {
        return donneurRepo.findByTypeDonneur(type);
    }

    @Transactional("transactionManager")
    public Donneur create(Donneur donneur) {
        log.info("Enregistrement d'un nouveau donneur : {} {}", donneur.getNomD(), donneur.getPrenomD());
        return donneurRepo.save(donneur);
    }

    @Transactional("transactionManager")
    public Donneur update(Integer id, Donneur details) {
        Donneur existing = donneurRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Donneur introuvable"));

        updateIdentityAndStatus(existing, details);
        updateContactAndDemographics(existing, details);
        updateEducationAndActivity(existing, details);

        return donneurRepo.save(existing);
    }

    private void updateIdentityAndStatus(Donneur existing, Donneur details) {
        if (details.getNomD() != null) existing.setNomD(details.getNomD());
        if (details.getPrenomD() != null) existing.setPrenomD(details.getPrenomD());
        if (details.getCinD() != null) existing.setCinD(details.getCinD());
        if (details.getTypeDonneur() != null) existing.setTypeDonneur(details.getTypeDonneur());
        if (details.getStatut() != null) existing.setStatut(details.getStatut());
        if (details.getAdulteD() != null) existing.setAdulteD(details.getAdulteD());
    }

    private void updateContactAndDemographics(Donneur existing, Donneur details) {
        if (details.getAdresseDomD() != null) existing.setAdresseDomD(details.getAdresseDomD());
        if (details.getAdresseEmailD() != null) existing.setAdresseEmailD(details.getAdresseEmailD());
        if (details.getTelephoneD() != null) existing.setTelephoneD(details.getTelephoneD());
        if (details.getTelephoneWhatsAppD() != null) existing.setTelephoneWhatsAppD(details.getTelephoneWhatsAppD());
        if (details.getDateNaissD() != null) existing.setDateNaissD(details.getDateNaissD());
        if (details.getNationaliteD() != null) existing.setNationaliteD(details.getNationaliteD());
        if (details.getOrigineGeogD() != null) existing.setOrigineGeogD(details.getOrigineGeogD());
        if (details.getPersonneAcontacterD() != null) existing.setPersonneAcontacterD(details.getPersonneAcontacterD());
    }

    private void updateEducationAndActivity(Donneur existing, Donneur details) {
        if (details.getEvolutionProf() != null) existing.setEvolutionProf(details.getEvolutionProf());
        if (details.getTypeCarnetD() != null) existing.setTypeCarnetD(details.getTypeCarnetD());
        if (details.getNumCarnetD() != null) existing.setNumCarnetD(details.getNumCarnetD());
        if (details.getNiveauEducation() != null) existing.setNiveauEducation(details.getNiveauEducation());
        if (details.getEnEtatActivite() != null) existing.setEnEtatActivite(details.getEnEtatActivite());
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        if (!donneurRepo.existsById(id)) {
            throw new EntityNotFoundException("Impossible de supprimer : Donneur inexistant");
        }
        donneurRepo.deleteById(id);
        log.warn("Le donneur ID: {} a été supprimé de la base.", id);
    }
}