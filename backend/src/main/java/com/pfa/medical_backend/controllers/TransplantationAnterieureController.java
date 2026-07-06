package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.TransplantationAnterieureDTO;
import com.pfa.medical_backend.entities.TransplantationAnterieure;
import com.pfa.medical_backend.services.TransplantationAnterieureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transplantations-anterieures")
public class TransplantationAnterieureController {

    private final TransplantationAnterieureService taService;

    public TransplantationAnterieureController(TransplantationAnterieureService taService) {
        this.taService = taService;
    }

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

    private TransplantationAnterieure toEntity(TransplantationAnterieureDTO dto) {
        TransplantationAnterieure ta = new TransplantationAnterieure();
        ta.setIdentifiantTR(dto.getIdentifiantTR());
        ta.setDateTR(dto.getDateTR());
        ta.setLieuTR(dto.getLieuTR());
        ta.setLieuSuiviTR(dto.getLieuSuiviTR());
        ta.setTypeDonneur(dto.getTypeDonneur());
        ta.setHlaDonneur(dto.getHlaDonneur());
        ta.setTraitementImmunoSuppresseurInduction(dto.getTraitementImmunoSuppresseurInduction());
        ta.setTraitementImmunoSuppresseurEntretien(dto.getTraitementImmunoSuppresseurEntretien());
        ta.setCausePerteGreffonRenale(dto.getCausePerteGreffonRenale());
        ta.setDateRetourDialyse(dto.getDateRetourDialyse());
        ta.setTransplantectomie(dto.getTransplantectomie());
        ta.setTransplantectomieIndication(dto.getTransplantectomieIndication());
        return ta;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<TransplantationAnterieureDTO> getAll(@RequestParam(required = false) String patientId) {
        List<TransplantationAnterieure> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? taService.getByPatient(patientId) 
            : taService.getAll();
            
        return list.stream().map(this::toDTO).toList();
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
    public ResponseEntity<TransplantationAnterieureDTO> create(@PathVariable String patientId, @RequestBody TransplantationAnterieureDTO dto) {
        TransplantationAnterieure created = taService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<TransplantationAnterieureDTO> update(@PathVariable Integer id, @RequestBody TransplantationAnterieureDTO detailsDto) {
        TransplantationAnterieure updated = taService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        taService.delete(id);
        return ResponseEntity.noContent().build();
    }
}