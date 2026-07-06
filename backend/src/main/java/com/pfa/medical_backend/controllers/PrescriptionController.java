package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.PrescriptionDTO;
import com.pfa.medical_backend.entities.Prescription;
import com.pfa.medical_backend.services.PrescriptionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

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

    private Prescription toEntity(PrescriptionDTO dto) {
        Prescription p = new Prescription();
        p.setIdentifiantPrescription(dto.getIdentifiantPrescription());
        p.setDatePremierePrise(dto.getDatePremierePrise());
        p.setDosageMed(dto.getDosageMed());
        p.setDateSortie(dto.getDateSortie());
        return p;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_IMMUNO')")
    public List<PrescriptionDTO> getAll(@RequestParam(required = false) Integer traitementId) {
        List<Prescription> list = (traitementId != null) 
            ? prescriptionService.getByTraitement(traitementId) 
            : prescriptionService.getAll();
            
        return list.stream().map(this::toDTO).toList();
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
            @Valid @RequestBody PrescriptionDTO dto) {
        Prescription created = prescriptionService.create(toEntity(dto), traitementId, medicamentId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<PrescriptionDTO> update(@PathVariable Integer id, @RequestBody PrescriptionDTO detailsDto) {
        Prescription updated = prescriptionService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        prescriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}