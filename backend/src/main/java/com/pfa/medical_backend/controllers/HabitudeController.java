package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.HabitudeDTO;
import com.pfa.medical_backend.entities.Habitude;
import com.pfa.medical_backend.services.HabitudeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/habitudes")
public class HabitudeController {

    private final HabitudeService habitudeService;

    public HabitudeController(HabitudeService habitudeService) {
        this.habitudeService = habitudeService;
    }

    private HabitudeDTO toDTO(Habitude h) {
        HabitudeDTO dto = new HabitudeDTO();
        dto.setIdentifiantHA(h.getIdentifiantHA());
        dto.setLibelleHA(h.getLibelleHA());
        dto.setTypeSubstance(h.getTypeSubstance());
        dto.setDetails(h.getDetails());
        dto.setQuantiteConsomme(h.getQuantiteConsomme());
        dto.setPeriodeExposition(h.getPeriodeExposition());
        dto.setSevrage(h.getSevrage());

        if (h.getPatient() != null) {
            dto.setPatientId(h.getPatient().getIdentifiantP());
        }

        if (h.getDonneur() != null) {
            dto.setDonorId(h.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    private Habitude toEntity(HabitudeDTO dto) {
        Habitude h = new Habitude();
        h.setIdentifiantHA(dto.getIdentifiantHA());
        h.setLibelleHA(dto.getLibelleHA());
        h.setTypeSubstance(dto.getTypeSubstance());
        h.setDetails(dto.getDetails());
        h.setQuantiteConsomme(dto.getQuantiteConsomme());
        h.setPeriodeExposition(dto.getPeriodeExposition());
        h.setSevrage(dto.getSevrage());
        return h;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<HabitudeDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        List<Habitude> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = habitudeService.getByPatient(patientId);
        } else if (donorId != null) {
            list = habitudeService.getByDonneur(donorId);
        } else {
            list = habitudeService.getAll();
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<HabitudeDTO> getById(@PathVariable Integer id) {
        return habitudeService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<HabitudeDTO> create(@PathVariable String patientId, @RequestBody HabitudeDTO dto) {
        Habitude created = habitudeService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<HabitudeDTO> createForDonor(@PathVariable Integer donorId, @RequestBody HabitudeDTO dto) {
        Habitude created = habitudeService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<HabitudeDTO> update(@PathVariable Integer id, @RequestBody HabitudeDTO detailsDto) {
        Habitude updated = habitudeService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        habitudeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}