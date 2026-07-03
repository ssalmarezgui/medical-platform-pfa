package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.TraitementImmunoSuppresseurRepository;

import jakarta.persistence.EntityManager;

import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;

import java.util.List;

@RestController
@RequestMapping("/api/traitements-immuno")
@Slf4j
public class TraitementImmunoSuppresseurController {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private TraitementImmunoSuppresseurRepository tisRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_IMMUNO')")
    public ResponseEntity<List<TraitementImmunoSuppresseur>> getAllByPatient(@RequestParam(required = false) String patientId) {
        log.info("Consultation de l'historique d'immuno-suppression");
        entityManager.clear(); 
        
        List<TraitementImmunoSuppresseur> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = tisRepository.findByPatient_IdentifiantP(patientId);
        } else {
            list = tisRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseur> getById(@PathVariable Integer id) {
        return tisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseur> create(@RequestBody TraitementImmunoSuppresseur tis) {
        if (tis.getPatient() == null || tis.getPatient().getIdentifiantP() == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Création d'un traitement d'immuno-suppression pour le patient : {}", tis.getPatient().getIdentifiantP());
        PatientIdAdmin patient = patientRepository.findById(tis.getPatient().getIdentifiantP())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        tis.setPatient(patient);

        TraitementImmunoSuppresseur saved = tisRepository.save(tis);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseur> update(@PathVariable Integer id, @RequestBody TraitementImmunoSuppresseur details) {
        return tisRepository.findById(id).map(existing -> {
            existing.setDciTIS(details.getDciTIS());
            existing.setDurerTraitementTIS(details.getDurerTraitementTIS());

            if (existing instanceof TISInduction && details instanceof TISInduction) {
                TISInduction extInd = (TISInduction) existing;
                TISInduction detInd = (TISInduction) details;
                if (detInd.getGrafalonTISI() != null) extInd.setGrafalonTISI(detInd.getGrafalonTISI());
                if (detInd.getAtgTISI() != null) extInd.setAtgTISI(detInd.getAtgTISI());
                if (detInd.getTymoglobulineTISI() != null) extInd.setTymoglobulineTISI(detInd.getTymoglobulineTISI());
                if (detInd.getSimulectTISI() != null) extInd.setSimulectTISI(detInd.getSimulectTISI());
            } else if (existing instanceof TISEntretien && details instanceof TISEntretien) {
                TISEntretien extEnt = (TISEntretien) existing;
                TISEntretien detEnt = (TISEntretien) details;
                if (detEnt.getMmfTISE() != null) extEnt.setMmfTISE(detEnt.getMmfTISE());
                if (detEnt.getAzathioprineTISE() != null) extEnt.setAzathioprineTISE(detEnt.getAzathioprineTISE());
                if (detEnt.getCyclusporineTISE() != null) extEnt.setCyclusporineTISE(detEnt.getCyclusporineTISE());
                if (detEnt.getTacrolimusTISE() != null) extEnt.setTacrolimusTISE(detEnt.getTacrolimusTISE());
                if (detEnt.getPrednisoleTISE() != null) extEnt.setPrednisoleTISE(detEnt.getPrednisoleTISE());
                if (detEnt.getPrednisoluneTISE() != null) extEnt.setPrednisoluneTISE(detEnt.getPrednisoluneTISE());
                if (detEnt.getSirolimus() != null) extEnt.setSirolimus(detEnt.getSirolimus());
            }
            
            return ResponseEntity.ok(tisRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!tisRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        log.warn("Suppression de la fiche d'immuno-suppression : {}", id);
        tisRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}