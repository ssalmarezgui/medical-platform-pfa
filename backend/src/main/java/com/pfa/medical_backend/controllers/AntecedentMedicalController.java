package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentMedicalDTO;
import com.pfa.medical_backend.entities.AntecedentMedical;
import com.pfa.medical_backend.services.AntecedentMedicalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/antecedents-medicaux")
public class AntecedentMedicalController {

    private final AntecedentMedicalService amService;

    public AntecedentMedicalController(AntecedentMedicalService amService) {
        this.amService = amService;
    }

    private AntecedentMedicalDTO toDTO(AntecedentMedical am) {
        AntecedentMedicalDTO dto = new AntecedentMedicalDTO();
        dto.setIdentifiantAMed(am.getIdentifiantAMed());
        dto.setType(am.getType());
        dto.setSousType(am.getSousType());
        dto.setDateDebut(am.getDateDebut());
        dto.setComplication(am.getComplication());
        dto.setTraitement(am.getTraitement());
        dto.setEvolution(am.getEvolution());
        dto.setTypeLocalisation(am.getTypeLocalisation());
        dto.setCauseSiege(am.getCauseSiege());
        dto.setLieuPriseEnCharge(am.getLieuPriseEnCharge());
        if (am.getPatient() != null) {
            dto.setPatientId(am.getPatient().getIdentifiantP());
        }

        if (am.getDonneur() != null) {
            dto.setDonorId(am.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    private AntecedentMedical toEntity(AntecedentMedicalDTO dto) {
        AntecedentMedical am = new AntecedentMedical();
        am.setIdentifiantAMed(dto.getIdentifiantAMed());
        am.setType(dto.getType());
        am.setSousType(dto.getSousType());
        am.setDateDebut(dto.getDateDebut());
        am.setComplication(dto.getComplication());
        am.setTraitement(dto.getTraitement());
        am.setEvolution(dto.getEvolution());
        am.setTypeLocalisation(dto.getTypeLocalisation());
        am.setCauseSiege(dto.getCauseSiege());
        am.setLieuPriseEnCharge(dto.getLieuPriseEnCharge());
        return am;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<AntecedentMedicalDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        List<AntecedentMedical> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = amService.getByPatient(patientId);
        } else if (donorId != null) {
            list = amService.getByDonneur(donorId);
        } else {
            list = amService.getAll();
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<AntecedentMedicalDTO> getById(@PathVariable Integer id) {
        return amService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<AntecedentMedicalDTO> create(@PathVariable String patientId, @RequestBody AntecedentMedicalDTO dto) {
        AntecedentMedical created = amService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<AntecedentMedicalDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentMedicalDTO dto) {
        AntecedentMedical created = amService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<AntecedentMedicalDTO> update(@PathVariable Integer id, @RequestBody AntecedentMedicalDTO detailsDto) {
        AntecedentMedical updated = amService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        amService.delete(id);
        return ResponseEntity.noContent().build();
    }
}