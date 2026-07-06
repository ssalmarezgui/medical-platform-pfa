package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.EffetSecondaireDTO;
import com.pfa.medical_backend.entities.EffetSecondaire;
import com.pfa.medical_backend.services.EffetSecondaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/effets-secondaires")

public class EffetSecondaireController {

    @Autowired
    private EffetSecondaireService esService;

    private EffetSecondaireDTO toDTO(EffetSecondaire es) {
        EffetSecondaireDTO dto = new EffetSecondaireDTO();
        dto.setIdentifiantEFS(es.getIdentifiantEFS());
        dto.setLibelleEFS(es.getLibelleEFS());
        dto.setDescriptionEFS(es.getDescriptionEFS());
        dto.setRecommendationEFS(es.getRecommendationEFS());
        
        if (es.getPrescription() != null) {
            dto.setPrescriptionId(es.getPrescription().getIdentifiantPrescription());
            if (es.getPrescription().getMedicament() != null) {
                dto.setMedicamentNom(es.getPrescription().getMedicament().getNomCommercialMed());
            }
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<EffetSecondaireDTO> getAll(@RequestParam(required = false) Integer prescriptionId) {
        List<EffetSecondaire> list = (prescriptionId != null) 
            ? esService.getByPrescription(prescriptionId) 
            : esService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<EffetSecondaireDTO> getById(@PathVariable Integer id) {
        return esService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/prescription/{prescriptionId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<EffetSecondaireDTO> create(
            @PathVariable Integer prescriptionId, 
            @RequestBody EffetSecondaire es) {
        EffetSecondaire created = esService.create(es, prescriptionId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<EffetSecondaireDTO> update(@PathVariable Integer id, @RequestBody EffetSecondaire details) {
        EffetSecondaire updated = esService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        esService.delete(id);
        return ResponseEntity.noContent().build();
    }
}