package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.ImagerieDTO;
import com.pfa.medical_backend.entities.Imagerie;
import com.pfa.medical_backend.services.ImagerieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imageries")

public class ImagerieController {

    @Autowired
    private ImagerieService imagerieService;

    private ImagerieDTO toDTO(Imagerie im) {
        ImagerieDTO dto = new ImagerieDTO();
        dto.setIdentifiantIm(im.getIdentifiantIm());
        dto.setExamenIm(im.getExamenIm());
        dto.setDateIm(im.getDateIm());
        dto.setResultatIm(im.getResultatIm());
        if (im.getPatient() != null) {
            dto.setPatientId(im.getPatient().getIdentifiantP());
        }
        if (im.getDonneur() != null) {
            dto.setDonorId(im.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<ImagerieDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId

) {
        // Sécurisation contre les chaînes de caractères vides
        List<Imagerie> list ;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = imagerieService.getByPatient(patientId);
        } else if (donorId != null){
            list = imagerieService.getByDonneur(donorId);
        } else {
            list = imagerieService.getAll();

        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<ImagerieDTO> getById(@PathVariable Integer id) {
        return imagerieService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<ImagerieDTO> create(@PathVariable String patientId, @RequestBody Imagerie imagerie) {
        Imagerie created = imagerieService.create(imagerie, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<ImagerieDTO> createForDonor(@PathVariable Integer donorId, @RequestBody Imagerie imagerie) {
        Imagerie created = imagerieService.createForDonor(imagerie, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")

    public ResponseEntity<ImagerieDTO> update(@PathVariable Integer id, @RequestBody Imagerie details) {
        Imagerie updated = imagerieService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        imagerieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}