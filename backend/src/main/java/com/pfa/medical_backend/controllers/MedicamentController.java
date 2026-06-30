package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.MedicamentDTO;
import com.pfa.medical_backend.entities.Medicament;
import com.pfa.medical_backend.services.MedicamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medicaments")

public class MedicamentController {

    @Autowired
    private MedicamentService medicamentService;

    // Convertisseur d'Entité vers DTO
    private MedicamentDTO toDTO(Medicament m) {
        MedicamentDTO dto = new MedicamentDTO();
        dto.setIdentifiantMed(m.getIdentifiantMed());
        dto.setNomCommercialMed(m.getNomCommercialMed());
        dto.setDescriptionMed(m.getDescriptionMed());
        dto.setTypeMed(m.getTypeMed());
        dto.setPosologieMed(m.getPosologieMed());
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<MedicamentDTO> getAll(@RequestParam(required = false) String type) {
        List<Medicament> list = (type != null) 
            ? medicamentService.getByType(type) 
            : medicamentService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<MedicamentDTO> getById(@PathVariable Integer id) {
        return medicamentService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<MedicamentDTO> create(@RequestBody Medicament m) {
        Medicament created = medicamentService.create(m);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<MedicamentDTO> update(@PathVariable Integer id, @RequestBody Medicament details) {
        Medicament updated = medicamentService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        medicamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}