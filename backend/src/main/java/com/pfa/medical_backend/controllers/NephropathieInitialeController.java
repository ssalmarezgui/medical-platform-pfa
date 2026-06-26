package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.NephropathieInitialeDTO;
import com.pfa.medical_backend.entities.NephropathieInitiale;
import com.pfa.medical_backend.services.NephropathieInitialeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nephropathies")
@CrossOrigin(origins = "*")
public class NephropathieInitialeController {

    @Autowired
    private NephropathieInitialeService niService;

    // Convertisseur d'Entité vers DTO
    private NephropathieInitialeDTO toDTO(NephropathieInitiale ni) {
        NephropathieInitialeDTO dto = new NephropathieInitialeDTO();
        dto.setIdentifiantNI(ni.getIdentifiantNI());
        dto.setTypeCliniqueNI(ni.getTypeCliniqueNI());
        dto.setCauseNI(ni.getCauseNI());
        dto.setTypeHistologiqueNI(ni.getTypeHistologiqueNI());
        dto.setStadeMaladiNI(ni.getStadeMaladiNI());
        if (ni.getPatient() != null) {
            dto.setPatientId(ni.getPatient().getIdentifiantP());
        }
        return dto;
    }

    @GetMapping
    public List<NephropathieInitialeDTO> getAll(@RequestParam(required = false) String patientId) {
        // Sécurisation contre les chaînes de caractères vides
        List<NephropathieInitiale> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? niService.getByPatient(patientId) 
            : niService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NephropathieInitialeDTO> getById(@PathVariable Integer id) {
        return niService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<NephropathieInitialeDTO> create(@PathVariable String patientId, @RequestBody NephropathieInitiale ni) {
        NephropathieInitiale created = niService.create(ni, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NephropathieInitialeDTO> update(@PathVariable Integer id, @RequestBody NephropathieInitiale details) {
        NephropathieInitiale updated = niService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        niService.delete(id);
        return ResponseEntity.noContent().build();
    }
}