package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.BiochimieUrinesRepository;
import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.BiochimieUrinesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/biochimie-urinaire")
public class BiochimieUrinesController {

    @Autowired
    private BiochimieUrinesService buService;

    @Autowired
    private BiochimieUrinesRepository buRepository;

    private BiochimieUrinesDTO toDTO(BiochimieUrines bu) {
        BiochimieUrinesDTO dto = new BiochimieUrinesDTO();
        dto.setIdentifiantBUF(bu.getIdentifiantBUF());
        dto.setLibelleBUF(bu.getLibelleBUF());
        dto.setDescriptionBUF(bu.getDescriptionBUF());
        if (bu.getPatient() != null) {
            dto.setPatientId(bu.getPatient().getIdentifiantP());
        }
        if (bu.getDonneur() != null) {
            dto.setDonorId(bu.getDonneur().getIdentifiantD());
        }
        if (bu.getAnalyses() != null) {
            List<AnalyseDTO> list = bu.getAnalyses().stream().map(a -> {
                AnalyseDTO adto = new AnalyseDTO();
                adto.setIdentifiantAna(a.getIdentifiantAna());
                adto.setDateAna(a.getDateAna());
                adto.setResultatAna(a.getResultatAna());
                adto.setValeurAna(a.getValeurAna());
                adto.setTypeAnalyse(a.getTypeAnalyse());
                return adto;
            }).toList();
            dto.setAnalyses(list);
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<BiochimieUrinesDTO> getAll() {
        return buRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BiochimieUrinesDTO> getByPatient(@PathVariable String patientId) {
        return buService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BiochimieUrinesDTO> save(@PathVariable String patientId, @RequestBody BiochimieUrines bu) {
        BiochimieUrines saved = buService.createOrUpdate(patientId, bu);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BiochimieUrinesDTO> getByDonneur(@PathVariable Integer donorId) {
        return buService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BiochimieUrinesDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody BiochimieUrines bu) {
        BiochimieUrines saved = buService.createOrUpdateForDonor(donorId, bu);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        buService.delete(id);
        return ResponseEntity.noContent().build();
    }
}