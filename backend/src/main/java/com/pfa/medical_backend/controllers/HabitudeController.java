package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.HabitudeDTO;
import com.pfa.medical_backend.entities.Habitude;
import com.pfa.medical_backend.services.HabitudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/habitudes")
@CrossOrigin(origins = "*")
public class HabitudeController {

    @Autowired
    private HabitudeService habitudeService;

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

    @GetMapping
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
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HabitudeDTO> getById(@PathVariable Integer id) {
        return habitudeService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<HabitudeDTO> create(@PathVariable String patientId, @RequestBody Habitude habitude) {
        Habitude created = habitudeService.create(habitude, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    public ResponseEntity<HabitudeDTO> createForDonor(@PathVariable Integer donorId, @RequestBody Habitude habitude) {
        Habitude created = habitudeService.createForDonor(habitude, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitudeDTO> update(@PathVariable Integer id, @RequestBody Habitude details) {
        Habitude updated = habitudeService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        habitudeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}