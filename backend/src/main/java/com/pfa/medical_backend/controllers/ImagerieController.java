package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.ImagerieDTO;
import com.pfa.medical_backend.entities.Imagerie;
import com.pfa.medical_backend.services.ImagerieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/imageries")
public class ImagerieController {

    private final ImagerieService imagerieService;

    public ImagerieController(ImagerieService imagerieService) {
        this.imagerieService = imagerieService;
    }

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

    private Imagerie toEntity(ImagerieDTO dto) {
        Imagerie im = new Imagerie();
        im.setIdentifiantIm(dto.getIdentifiantIm());
        im.setExamenIm(dto.getExamenIm());
        im.setDateIm(dto.getDateIm());
        im.setResultatIm(dto.getResultatIm());
        return im;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<ImagerieDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        List<Imagerie> list;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = imagerieService.getByPatient(patientId);
        } else if (donorId != null){
            list = imagerieService.getByDonneur(donorId);
        } else {
            list = imagerieService.getAll();
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')") 
    public ResponseEntity<ImagerieDTO> getById(@PathVariable Integer id) {
        return imagerieService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<ImagerieDTO> create(@PathVariable String patientId, @RequestBody ImagerieDTO dto) {
        Imagerie created = imagerieService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<ImagerieDTO> createForDonor(@PathVariable Integer donorId, @RequestBody ImagerieDTO dto) {
        Imagerie created = imagerieService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<ImagerieDTO> update(@PathVariable Integer id, @RequestBody ImagerieDTO detailsDto) {
        Imagerie updated = imagerieService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        imagerieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}