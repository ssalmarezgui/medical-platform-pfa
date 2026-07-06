package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentFamilialDTO;
import com.pfa.medical_backend.entities.AntecedentFamilial;
import com.pfa.medical_backend.services.AntecedentFamilialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/antecedents-familiaux")
public class AntecedentFamilialController {

    private final AntecedentFamilialService afService;

    public AntecedentFamilialController(AntecedentFamilialService afService) {
        this.afService = afService;
    }

    private AntecedentFamilialDTO toDTO(AntecedentFamilial af) {
        AntecedentFamilialDTO dto = new AntecedentFamilialDTO();
        dto.setIdentifiantAF(af.getIdentifiantAF());
        dto.setTypeRelation(af.getTypeRelation());
        dto.setDateDeNaissance(af.getDateDeNaissance());
        dto.setProfession(af.getProfession());
        dto.setTares(af.getTares());
        dto.setConsanguinite(af.getConsanguinite());

        if (af.getPatient() != null) {
            dto.setPatientId(af.getPatient().getIdentifiantP());
        }

        if (af.getDonneur() != null) {
            dto.setDonorId(af.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    private AntecedentFamilial toEntity(AntecedentFamilialDTO dto) {
        AntecedentFamilial af = new AntecedentFamilial();
        af.setIdentifiantAF(dto.getIdentifiantAF());
        af.setTypeRelation(dto.getTypeRelation());
        af.setDateDeNaissance(dto.getDateDeNaissance());
        af.setProfession(dto.getProfession());
        af.setTares(dto.getTares());
        af.setConsanguinite(dto.getConsanguinite());
        return af;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<AntecedentFamilialDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        List<AntecedentFamilial> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = afService.getByPatient(patientId);
        } else if (donorId != null){
            list = afService.getByDonneur(donorId);
        } else {
            list = afService.getAll();
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<AntecedentFamilialDTO> getById(@PathVariable Integer id) {
        return afService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<AntecedentFamilialDTO> create(@PathVariable String patientId, @RequestBody AntecedentFamilialDTO dto) {
        AntecedentFamilial created = afService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<AntecedentFamilialDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentFamilialDTO dto) {
        AntecedentFamilial created = afService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<AntecedentFamilialDTO> update(@PathVariable Integer id, @RequestBody AntecedentFamilialDTO detailsDto) {
        AntecedentFamilial updated = afService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        afService.delete(id);
        return ResponseEntity.noContent().build();
    }
}