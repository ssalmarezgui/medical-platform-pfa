package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.BilanImmunologiqueRepository;

import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.BilanImmunologiqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/immunologie")

public class BilanImmunologiqueController {

    @Autowired
    private BilanImmunologiqueService biService;

    @Autowired
    private BilanImmunologiqueRepository biRepository;

    // Convertisseur d'Entité vers DTO
    private BilanImmunologiqueDTO toDTO(BilanImmunologique bi) {
        BilanImmunologiqueDTO dto = new BilanImmunologiqueDTO();
        dto.setIdentifiantBI(bi.getIdentifiantBI());
        dto.setTypageHLA(bi.getTypageHLA());
        dto.setBilanImmuno(bi.getBilanImmuno());
        if (bi.getPatient() != null) {
            dto.setPatientId(bi.getPatient().getIdentifiantP());
        }
        if (bi.getDonneur() != null) {
            dto.setDonorId(bi.getDonneur().getIdentifiantD());
        }
        if (bi.getAnalyses() != null) {
            List<AnalyseDTO> list = bi.getAnalyses().stream().map(a -> {
                AnalyseDTO adto = new AnalyseDTO();
                adto.setIdentifiantAna(a.getIdentifiantAna());
                adto.setDateAna(a.getDateAna());
                adto.setResultatAna(a.getResultatAna());
                adto.setValeurAna(a.getValeurAna());
                adto.setTypeAnalyse(a.getTypeAnalyse());
                return adto;
            }).collect(Collectors.toList());
            dto.setAnalyses(list);
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<BilanImmunologiqueDTO> getAll() {
        return biRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<BilanImmunologiqueDTO> getByPatient(@PathVariable String patientId) {
        return biService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<BilanImmunologiqueDTO> save(@PathVariable String patientId, @RequestBody BilanImmunologique bi) {
        BilanImmunologique saved = biService.createOrUpdate(patientId, bi);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    public ResponseEntity<BilanImmunologiqueDTO> getByDonneur(@PathVariable Integer donorId) {
        return biService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<BilanImmunologiqueDTO> saveForDonneur(@PathVariable Integer donorId, @RequestBody BilanImmunologique bi) {
        BilanImmunologique saved = biService.createOrUpdateForDonor(donorId, bi);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        biService.delete(id);
        return ResponseEntity.noContent().build();
    }
}