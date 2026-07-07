package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.BilanPreGreffeDTO;
import com.pfa.medical_backend.entities.BilanPreGreffe;
import com.pfa.medical_backend.services.BilanPreGreffeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bilans-pregreffe")
public class BilanPreGreffeController {

    private final BilanPreGreffeService bpgService;

    public BilanPreGreffeController(BilanPreGreffeService bpgService) {
        this.bpgService = bpgService;
    }

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

    private BilanPreGreffe toEntity(BilanPreGreffeDTO dto) {
        BilanPreGreffe bpg = new BilanPreGreffe();
        bpg.setIdentifiantB(dto.getIdentifiantB());
        bpg.setDateBilanB(dto.getDateBilanB());
        bpg.setDescriptionBilanB(dto.getDescriptionBilanB());
        bpg.setResultatBilanB(dto.getResultatBilanB());
        bpg.setRapportBilanB(dto.getRapportBilanB());
        return bpg;
    }

    @GetMapping
    public List<BilanPreGreffeDTO> getAll(@RequestParam(required = false) Integer nephropathieId) {
        List<BilanPreGreffe> list = (nephropathieId != null) 
            ? bpgService.getByNephropathie(nephropathieId) 
            : bpgService.getAll();
            
        return list.stream().map(this::toDTO).toList();
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
            @RequestBody BilanPreGreffeDTO dto) {
        BilanPreGreffe created = bpgService.create(toEntity(dto), nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<BilanPreGreffeDTO> update(@PathVariable Integer id, @RequestBody BilanPreGreffeDTO detailsDto) {
        BilanPreGreffe updated = bpgService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        bpgService.delete(id);
        return ResponseEntity.noContent().build();
    }
}