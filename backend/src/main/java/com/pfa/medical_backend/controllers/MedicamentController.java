package com.pfa.medical_backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfa.medical_backend.entities.Medicament;
import com.pfa.medical_backend.services.MedicamentService;

@RestController
@RequestMapping("/api/medicaments")
@CrossOrigin(origins = "*")
public class MedicamentController {

    @Autowired private MedicamentService medicamentService;

    @GetMapping
    public List<Medicament> getAll() {
        return medicamentService.getAll();
    }
    
    @GetMapping("/{id}/interactions")
    public List<Medicament> getInteractions(@PathVariable Integer id) {
        return medicamentService.getInteractions(id);
    }

    @PostMapping("/{id1}/lier-interaction/{id2}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> lier(@PathVariable Integer id1, @PathVariable Integer id2) {
        medicamentService.ajouterInteraction(id1, id2);
        return ResponseEntity.ok().build();
    }
}