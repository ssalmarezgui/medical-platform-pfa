package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.ParametresBiopsiquesDTO;
import com.pfa.medical_backend.entities.ParametresBiopsiques;
import com.pfa.medical_backend.services.ParametresBiopsiquesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/biopsies")
@CrossOrigin(origins = "*")
public class ParametresBiopsiquesController {

    @Autowired
    private ParametresBiopsiquesService pbService;

    // Convertisseur d'Entité vers DTO
    private ParametresBiopsiquesDTO toDTO(ParametresBiopsiques pb) {
        ParametresBiopsiquesDTO dto = new ParametresBiopsiquesDTO();
        dto.setIdentifiantPB(pb.getIdentifiantPB());
        if (pb.getNephropathie() != null) {
            dto.setNephropathieId(pb.getNephropathie().getIdentifiantNI());
        }
        return dto;
    }

    @GetMapping("/nephropathie/{nephropathieId}")
    public ResponseEntity<ParametresBiopsiquesDTO> getByNephropathie(@PathVariable Integer nephropathieId) {
        return pbService.getByNephropathie(nephropathieId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/nephropathie/{nephropathieId}")
    public ResponseEntity<ParametresBiopsiquesDTO> create(
            @PathVariable Integer nephropathieId, 
            @RequestBody ParametresBiopsiques pb) {
        ParametresBiopsiques created = pbService.create(pb, nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParametresBiopsiquesDTO> update(@PathVariable Integer id, @RequestBody ParametresBiopsiques details) {
        ParametresBiopsiques updated = pbService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pbService.delete(id);
        return ResponseEntity.noContent().build();
    }
}