package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.repositories.DonneurRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DonneurService {

    @Autowired
    private DonneurRepository donneurRepo;

    public List<Donneur> getAll() {
        return donneurRepo.findAll();
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
            .orElseThrow(() -> new RuntimeException("Donneur introuvable"));

        if (details.getNomD() != null) existing.setNomD(details.getNomD());
        if (details.getPrenomD() != null) existing.setPrenomD(details.getPrenomD());
        if (details.getCinD() != null) existing.setCinD(details.getCinD());
        if (details.getTypeDonneur() != null) existing.setTypeDonneur(details.getTypeDonneur());
        if (details.getStatut() != null) existing.setStatut(details.getStatut());
        if (details.getAdresseDomD() != null) existing.setAdresseDomD(details.getAdresseDomD());
        // ajout des autres champs dans le futur enshallah

        return donneurRepo.save(existing);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        if (!donneurRepo.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Donneur inexistant");
        }
        donneurRepo.deleteById(id);
        log.warn("Le donneur ID: {} a été supprimé de la base.", id);
    }
}