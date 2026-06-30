package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.BiochimieSangRepository;

import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.BiochimieSangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/biochimie-sanguine")

public class BiochimieSangController {

    @Autowired
    private BiochimieSangService bsService;

    @Autowired
    private BiochimieSangRepository bsRepository;

    // Convertisseur d'Entité vers DTO
    private BiochimieSangDTO toDTO(BiochimieSang bs) {
        BiochimieSangDTO dto = new BiochimieSangDTO();
        dto.setIdentifiantBCS(bs.getIdentifiantBCS());
        dto.setLibelleBCS(bs.getLibelleBCS());
        dto.setDescriptionBCS(bs.getDescriptionBCS());
        if (bs.getPatient() != null) {
            dto.setPatientId(bs.getPatient().getIdentifiantP());
        }

        if (bs.getDonneur() != null) {
            dto.setDonorId(bs.getDonneur().getIdentifiantD());
        }
        if (bs.getAnalyses() != null) {
            List<AnalyseDTO> list = bs.getAnalyses().stream().map(a -> {
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
    public List<BiochimieSangDTO> getAll() {
        return bsRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<BiochimieSangDTO> getByPatient(@PathVariable String patientId) {
        return bsService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<BiochimieSangDTO> save(@PathVariable String patientId, @RequestBody BiochimieSang bs) {
        BiochimieSang saved = bsService.createOrUpdate(patientId, bs);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    public ResponseEntity<BiochimieSangDTO> getByDonneur(@PathVariable Integer donorId) {
        return bsService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<BiochimieSangDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody BiochimieSang bs) {
        BiochimieSang saved = bsService.createOrUpdateForDonor(donorId, bs);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        bsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}