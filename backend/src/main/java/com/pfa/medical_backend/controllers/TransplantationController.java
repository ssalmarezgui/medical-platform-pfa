package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.services.TransplantationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transplantations")
@CrossOrigin(origins = "*")
public class TransplantationController {

    @Autowired
    private TransplantationService transplantationService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public List<Transplantation> getAll() {
        return transplantationService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public ResponseEntity<Transplantation> getById(@PathVariable Integer id) {
        return transplantationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public List<Transplantation> getByPatient(@PathVariable String patientId) {
        return transplantationService.getByPatient(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<Transplantation> create(
            @RequestBody Transplantation transplantation,
            @RequestParam String patientId,
            @RequestParam Integer donneurId) {
        
        Transplantation saved = transplantationService.enregistrerGreffe(transplantation, patientId, donneurId);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN')")
    public Transplantation update(@PathVariable Integer id, @RequestBody Transplantation details) {
        return transplantationService.update(id, details);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        transplantationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}