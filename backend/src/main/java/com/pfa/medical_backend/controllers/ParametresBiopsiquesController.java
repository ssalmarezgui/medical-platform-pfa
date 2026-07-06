package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.ParametresBiopsiquesDTO;
import com.pfa.medical_backend.entities.ParametresBiopsiques;
import com.pfa.medical_backend.services.ParametresBiopsiquesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/biopsies")
public class ParametresBiopsiquesController {

    private final ParametresBiopsiquesService pbService;

    public ParametresBiopsiquesController(ParametresBiopsiquesService pbService) {
        this.pbService = pbService;
    }

    private ParametresBiopsiquesDTO toDTO(ParametresBiopsiques pb) {
        ParametresBiopsiquesDTO dto = new ParametresBiopsiquesDTO();
        dto.setIdentifiantPB(pb.getIdentifiantPB());
        if (pb.getNephropathie() != null) {
            dto.setNephropathieId(pb.getNephropathie().getIdentifiantNI());
        }
        return dto;
    }

    private ParametresBiopsiques toEntity(ParametresBiopsiquesDTO dto) {
        ParametresBiopsiques pb = new ParametresBiopsiques();
        pb.setIdentifiantPB(dto.getIdentifiantPB());
        return pb;
    }

    @GetMapping("/nephropathie/{nephropathieId}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<ParametresBiopsiquesDTO> getByNephropathie(@PathVariable Integer nephropathieId) {
        return pbService.getByNephropathie(nephropathieId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/nephropathie/{nephropathieId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<ParametresBiopsiquesDTO> create(
            @PathVariable Integer nephropathieId, 
            @RequestBody ParametresBiopsiquesDTO dto) {
        ParametresBiopsiques created = pbService.create(toEntity(dto), nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<ParametresBiopsiquesDTO> update(@PathVariable Integer id, @RequestBody ParametresBiopsiquesDTO detailsDto) {
        ParametresBiopsiques updated = pbService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pbService.delete(id);
        return ResponseEntity.noContent().build();
    }
}