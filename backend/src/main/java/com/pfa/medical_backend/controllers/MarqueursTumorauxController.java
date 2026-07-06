package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.MarqueursTumorauxRepository;
import com.pfa.medical_backend.dto.MarqueursTumorauxDTO;
import com.pfa.medical_backend.entities.MarqueursTumoraux;
import com.pfa.medical_backend.services.MarqueursTumorauxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/marqueurs-tumoraux")
public class MarqueursTumorauxController {

    @Autowired
    private MarqueursTumorauxService mtService;

    @Autowired
    private MarqueursTumorauxRepository mtRepository;

    private MarqueursTumorauxDTO toDTO(MarqueursTumoraux mt) {
        MarqueursTumorauxDTO dto = new MarqueursTumorauxDTO();
        dto.setIdentifiantMT(mt.getIdentifiantMT());
        dto.setNomM(mt.getNomM());
        dto.setResultat(mt.getResultat());
        if (mt.getPatient() != null) {
            dto.setPatientId(mt.getPatient().getIdentifiantP());
        }

        if (mt.getDonneur() != null) {
            dto.setDonorId(mt.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<MarqueursTumorauxDTO> getAll() {
        return mtRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<List<MarqueursTumorauxDTO>> getByPatient(@PathVariable String patientId) {
        List<MarqueursTumoraux> list = mtService.getByPatient(patientId);
        
        List<MarqueursTumorauxDTO> dtos = list.stream()
            .map(this::toDTO)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<List<MarqueursTumorauxDTO>> getByDonneur(@PathVariable Integer donorId) {
        List<MarqueursTumoraux> list = mtService.getByDonneur(donorId);
        
        List<MarqueursTumorauxDTO> dtos = list.stream()
            .map(this::toDTO)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<MarqueursTumorauxDTO> save(@PathVariable String patientId, @RequestBody MarqueursTumoraux mt) {
        MarqueursTumoraux saved = mtService.create(mt, patientId);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<MarqueursTumorauxDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody MarqueursTumoraux mt) {
        MarqueursTumoraux saved = mtService.createForDonor(mt, donorId);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        mtService.delete(id);
        return ResponseEntity.noContent().build();
    }
}