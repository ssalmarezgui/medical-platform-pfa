package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.TransplantationAnterieureDTO;
import com.pfa.medical_backend.entities.TransplantationAnterieure;
import com.pfa.medical_backend.services.TransplantationAnterieureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transplantations-anterieures")
public class TransplantationAnterieureController {

    @Autowired
    private TransplantationAnterieureService taService;

    private TransplantationAnterieureDTO toDTO(TransplantationAnterieure ta) {
        TransplantationAnterieureDTO dto = new TransplantationAnterieureDTO();
        dto.setIdentifiantTR(ta.getIdentifiantTR());
        dto.setDateTR(ta.getDateTR());
        dto.setLieuTR(ta.getLieuTR());
        dto.setLieuSuiviTR(ta.getLieuSuiviTR());
        dto.setTypeDonneur(ta.getTypeDonneur());
        dto.setHlaDonneur(ta.getHlaDonneur());
        dto.setTraitementImmunoSuppresseurInduction(ta.getTraitementImmunoSuppresseurInduction());
        dto.setTraitementImmunoSuppresseurEntretien(ta.getTraitementImmunoSuppresseurEntretien());
        dto.setCausePerteGreffonRenale(ta.getCausePerteGreffonRenale());
        dto.setDateRetourDialyse(ta.getDateRetourDialyse());
        dto.setTransplantectomie(ta.getTransplantectomie());
        dto.setTransplantectomieIndication(ta.getTransplantectomieIndication());
        if (ta.getPatient() != null) {
            dto.setPatientId(ta.getPatient().getIdentifiantP());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<TransplantationAnterieureDTO> getAll(@RequestParam(required = false) String patientId) {
        List<TransplantationAnterieure> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? taService.getByPatient(patientId) 
            : taService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<TransplantationAnterieureDTO> getById(@PathVariable Integer id) {
        return taService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<TransplantationAnterieureDTO> create(@PathVariable String patientId, @RequestBody TransplantationAnterieure ta) {
        TransplantationAnterieure created = taService.create(ta, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<TransplantationAnterieureDTO> update(@PathVariable Integer id, @RequestBody TransplantationAnterieure details) {
        TransplantationAnterieure updated = taService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        taService.delete(id);
        return ResponseEntity.noContent().build();
    }
}