package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.TraitementImmunoSuppresseurDTO;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.TraitementImmunoSuppresseurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traitements-immuno")
@Slf4j
public class TraitementImmunoSuppresseurController {

    private final EntityManager entityManager;
    private final TraitementImmunoSuppresseurRepository tisRepository;
    private final PatientIdAdminRepository patientRepository;

    public TraitementImmunoSuppresseurController(
        EntityManager entityManager,
        TraitementImmunoSuppresseurRepository tisRepository,
        PatientIdAdminRepository patientRepository
    ) {
        this.entityManager = entityManager;
        this.tisRepository = tisRepository;
        this.patientRepository = patientRepository;
    }

    private TraitementImmunoSuppresseurDTO toDTO(TraitementImmunoSuppresseur tis) {
        TraitementImmunoSuppresseurDTO dto = new TraitementImmunoSuppresseurDTO();
        dto.setId(tis.getIdentifiantTIS());
        dto.setDciTIS(tis.getDciTIS());
        dto.setDurerTraitementTIS(tis.getDurerTraitementTIS());
        if (tis.getPatient() != null) {
            dto.setPatientId(tis.getPatient().getIdentifiantP());
        }

        if (tis instanceof TISInduction ind) {
            dto.setType("INDUCTION");
            dto.setGrafalonTISI(ind.getGrafalonTISI());
            dto.setAtgTISI(ind.getAtgTISI());
            dto.setTymoglobulineTISI(ind.getTymoglobulineTISI());
            dto.setSimulectTISI(ind.getSimulectTISI());
        } else if (tis instanceof TISEntretien ent) {
            dto.setType("ENTRETIEN");
            dto.setMmfTISE(ent.getMmfTISE());
            dto.setAzathioprineTISE(ent.getAzathioprineTISE());
            dto.setCyclusporineTISE(ent.getCyclusporineTISE());
            dto.setTacrolimusTISE(ent.getTacrolimusTISE());
            dto.setPrednisoleTISE(ent.getPrednisoleTISE());
            dto.setPrednisoluneTISE(ent.getPrednisoluneTISE());
            dto.setSirolimus(ent.getSirolimus());
        }
        return dto;
    }

    private TraitementImmunoSuppresseur toEntity(TraitementImmunoSuppresseurDTO dto) {
        TraitementImmunoSuppresseur tis;
        if ("INDUCTION".equalsIgnoreCase(dto.getType())) {
            TISInduction ind = new TISInduction();
            ind.setGrafalonTISI(dto.getGrafalonTISI());
            ind.setAtgTISI(dto.getAtgTISI());
            ind.setTymoglobulineTISI(dto.getTymoglobulineTISI());
            ind.setSimulectTISI(dto.getSimulectTISI());
            tis = ind;
        } else {
            TISEntretien ent = new TISEntretien();
            ent.setMmfTISE(dto.getMmfTISE());
            ent.setAzathioprineTISE(dto.getAzathioprineTISE());
            ent.setCyclusporineTISE(dto.getCyclusporineTISE());
            ent.setTacrolimusTISE(dto.getTacrolimusTISE());
            ent.setPrednisoleTISE(dto.getPrednisoleTISE());
            ent.setPrednisoluneTISE(dto.getPrednisoluneTISE());
            ent.setSirolimus(dto.getSirolimus());
            tis = ent;
        }
        tis.setIdentifiantTIS(dto.getId());
        tis.setDciTIS(dto.getDciTIS());
        tis.setDurerTraitementTIS(dto.getDurerTraitementTIS());
        return tis;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_IMMUNO')")
    public ResponseEntity<List<TraitementImmunoSuppresseurDTO>> getAllByPatient(@RequestParam(required = false) String patientId) {
        log.info("Consultation de l'historique d'immuno-suppression");
        entityManager.clear(); 
        
        List<TraitementImmunoSuppresseur> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = tisRepository.findByPatient_IdentifiantP(patientId);
        } else {
            list = tisRepository.findAll();
        }
        
        List<TraitementImmunoSuppresseurDTO> dtos = list.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseurDTO> getById(@PathVariable Integer id) {
        return tisRepository.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseurDTO> create(@RequestBody TraitementImmunoSuppresseurDTO dto) {
        if (dto.getPatientId() == null || dto.getPatientId().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Création d'un traitement d'immuno-suppression pour le patient : {}", dto.getPatientId());
        PatientIdAdmin patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        TraitementImmunoSuppresseur tis = toEntity(dto);
        tis.setPatient(patient);

        TraitementImmunoSuppresseur saved = tisRepository.save(tis);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<TraitementImmunoSuppresseurDTO> update(@PathVariable Integer id, @RequestBody TraitementImmunoSuppresseurDTO detailsDto) {
        return tisRepository.findById(id).map(existing -> {
            TraitementImmunoSuppresseur details = toEntity(detailsDto);
            existing.setDciTIS(details.getDciTIS());
            existing.setDurerTraitementTIS(details.getDurerTraitementTIS());

            updateInductionDetails(existing, details);
            updateEntretienDetails(existing, details);
            
            TraitementImmunoSuppresseur saved = tisRepository.save(existing);
            return ResponseEntity.ok(toDTO(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void updateInductionDetails(TraitementImmunoSuppresseur existing, TraitementImmunoSuppresseur details) {
        if (existing instanceof TISInduction extInd && details instanceof TISInduction detInd) {
            if (detInd.getGrafalonTISI() != null) extInd.setGrafalonTISI(detInd.getGrafalonTISI());
            if (detInd.getAtgTISI() != null) extInd.setAtgTISI(detInd.getAtgTISI());
            if (detInd.getTymoglobulineTISI() != null) extInd.setTymoglobulineTISI(detInd.getTymoglobulineTISI());
            if (detInd.getSimulectTISI() != null) extInd.setSimulectTISI(detInd.getSimulectTISI());
        }
    }

    private void updateEntretienDetails(TraitementImmunoSuppresseur existing, TraitementImmunoSuppresseur details) {
        if (!(existing instanceof TISEntretien extEnt && details instanceof TISEntretien detEnt)) {
            return;
        }

        if (detEnt.getMmfTISE() != null) extEnt.setMmfTISE(detEnt.getMmfTISE());
        if (detEnt.getAzathioprineTISE() != null) extEnt.setAzathioprineTISE(detEnt.getAzathioprineTISE());
        if (detEnt.getCyclusporineTISE() != null) extEnt.setCyclusporineTISE(detEnt.getCyclusporineTISE());
        if (detEnt.getTacrolimusTISE() != null) extEnt.setTacrolimusTISE(detEnt.getTacrolimusTISE());
        if (detEnt.getPrednisoleTISE() != null) extEnt.setPrednisoleTISE(detEnt.getPrednisoleTISE());
        if (detEnt.getPrednisoluneTISE() != null) extEnt.setPrednisoluneTISE(detEnt.getPrednisoluneTISE());
        if (detEnt.getSirolimus() != null) extEnt.setSirolimus(detEnt.getSirolimus());
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