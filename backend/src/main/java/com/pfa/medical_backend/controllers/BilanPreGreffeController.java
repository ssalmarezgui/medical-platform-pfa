package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.BilanPreGreffeDTO;
import com.pfa.medical_backend.entities.BilanPreGreffe;
import com.pfa.medical_backend.services.BilanPreGreffeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bilans-pregreffe")
@CrossOrigin(origins = "*")
public class BilanPreGreffeController {

    @Autowired
    private BilanPreGreffeService bpgService;

    // Convertisseur d'Entité vers DTO
    private BilanPreGreffeDTO toDTO(BilanPreGreffe bpg) {
        BilanPreGreffeDTO dto = new BilanPreGreffeDTO();
        dto.setIdentifiantB(bpg.getIdentifiantB());
        dto.setDateBilanB(bpg.getDateBilanB());
        dto.setDescriptionBilanB(bpg.getDescriptionBilanB());
        dto.setResultatBilanB(bpg.getResultatBilanB());
        dto.setRapportBilanB(bpg.getRapportBilanB());
        
        if (bpg.getNephropathie() != null) {
            dto.setNephropathieId(bpg.getNephropathie().getIdentifiantNI());
            dto.setNephropathieTypeClinique(bpg.getNephropathie().getTypeCliniqueNI());
        }
        return dto;
    }

    @GetMapping
    public List<BilanPreGreffeDTO> getAll(@RequestParam(required = false) Integer nephropathieId) {
        List<BilanPreGreffe> list = (nephropathieId != null) 
            ? bpgService.getByNephropathie(nephropathieId) 
            : bpgService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BilanPreGreffeDTO> getById(@PathVariable Integer id) {
        return bpgService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/nephropathie/{nephropathieId}")
    public ResponseEntity<BilanPreGreffeDTO> create(
            @PathVariable Integer nephropathieId, 
            @RequestBody BilanPreGreffe bpg) {
        BilanPreGreffe created = bpgService.create(bpg, nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BilanPreGreffeDTO> update(@PathVariable Integer id, @RequestBody BilanPreGreffe details) {
        BilanPreGreffe updated = bpgService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        bpgService.delete(id);
        return ResponseEntity.noContent().build();
    }
}