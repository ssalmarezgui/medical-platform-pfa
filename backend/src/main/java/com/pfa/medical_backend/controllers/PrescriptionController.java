package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.PrescriptionDTO;
import com.pfa.medical_backend.entities.Prescription;
import com.pfa.medical_backend.services.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    private PrescriptionDTO toDTO(Prescription p) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setIdentifiantPrescription(p.getIdentifiantPrescription());
        dto.setDatePremierePrise(p.getDatePremierePrise());
        dto.setDosageMed(p.getDosageMed());
        dto.setDateSortie(p.getDateSortie());
        
        if (p.getTraitement() != null) {
            dto.setTraitementId(p.getTraitement().getIdentifiantTIS());
        }
        if (p.getMedicament() != null) {
            dto.setMedicamentId(p.getMedicament().getIdentifiantMed());
            dto.setMedicamentNomCommercial(p.getMedicament().getNomCommercialMed());
            dto.setMedicamentType(p.getMedicament().getTypeMed());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_IMMUNO')")
    public List<PrescriptionDTO> getAll(@RequestParam(required = false) Integer traitementId) {
        List<Prescription> list = (traitementId != null) 
            ? prescriptionService.getByTraitement(traitementId) 
            : prescriptionService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_IMMUNO')") 
    public ResponseEntity<PrescriptionDTO> getById(@PathVariable Integer id) {
        return prescriptionService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/traitement/{traitementId}/medicament/{medicamentId}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<PrescriptionDTO> create(
            @PathVariable Integer traitementId, 
            @PathVariable Integer medicamentId, 
            @RequestBody Prescription p) {
        Prescription created = prescriptionService.create(p, traitementId, medicamentId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<PrescriptionDTO> update(@PathVariable Integer id, @RequestBody Prescription details) {
        Prescription updated = prescriptionService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        prescriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}