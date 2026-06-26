package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentMedicalDTO;
import com.pfa.medical_backend.entities.AntecedentMedical;
import com.pfa.medical_backend.services.AntecedentMedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/antecedents-medicaux")
@CrossOrigin(origins = "*")
public class AntecedentMedicalController {

    @Autowired
    private AntecedentMedicalService amService;

    // Convertisseur d'Entité vers DTO
    private AntecedentMedicalDTO toDTO(AntecedentMedical am) {
        AntecedentMedicalDTO dto = new AntecedentMedicalDTO();
        dto.setIdentifiantAMed(am.getIdentifiantAMed());
        dto.setType(am.getType());
        dto.setSousType(am.getSousType());
        dto.setDateDebut(am.getDateDebut());
        dto.setComplication(am.getComplication());
        dto.setTraitement(am.getTraitement());
        dto.setEvolution(am.getEvolution());
        dto.setTypeLocalisation(am.getTypeLocalisation());
        dto.setCauseSiege(am.getCauseSiege());
        dto.setLieuPriseEnCharge(am.getLieuPriseEnCharge());
        if (am.getPatient() != null) {
            dto.setPatientId(am.getPatient().getIdentifiantP());
        }

        if (am.getDonneur() != null) {
            dto.setDonorId(am.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    public List<AntecedentMedicalDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        // Sécurisation contre les chaînes de caractères vides
        List<AntecedentMedical> list ;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = amService.getByPatient(patientId);
        } else if (donorId != null) {
            list = amService.getByDonneur(donorId);
        } else {
            list = amService.getAll();
        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AntecedentMedicalDTO> getById(@PathVariable Integer id) {
        return amService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<AntecedentMedicalDTO> create(@PathVariable String patientId, @RequestBody AntecedentMedical am) {
        AntecedentMedical created = amService.create(am, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    public ResponseEntity<AntecedentMedicalDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentMedical am) {
        AntecedentMedical created = amService.createForDonor(am, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AntecedentMedicalDTO> update(@PathVariable Integer id, @RequestBody AntecedentMedical details) {
        AntecedentMedical updated = amService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        amService.delete(id);
        return ResponseEntity.noContent().build();
    }
}