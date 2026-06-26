package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.MicrobiologieSerologieRepository;


import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.MicrobiologieSerologieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/microbiologie")
@CrossOrigin(origins = "*")
public class MicrobiologieSerologieController {

    @Autowired
    private MicrobiologieSerologieService msService;

    @Autowired
    private MicrobiologieSerologieRepository msRepository;

    // Convertisseur d'Entité vers DTO
    private MicrobiologieSerologieDTO toDTO(MicrobiologieSerologie ms) {
        MicrobiologieSerologieDTO dto = new MicrobiologieSerologieDTO();
        dto.setIdentifiantMS(ms.getIdentifiantMS());
        dto.setTypeMS(ms.getTypeMS());
        if (ms.getPatient() != null) {
            dto.setPatientId(ms.getPatient().getIdentifiantP());
        }
        if (ms.getDonneur() != null) {
            dto.setDonorId(ms.getDonneur().getIdentifiantD());
        }
        if (ms.getAnalyses() != null) {
            List<AnalyseDTO> list = ms.getAnalyses().stream().map(a -> {
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
    public List<MicrobiologieSerologieDTO> getAll() {
        return msRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<MicrobiologieSerologieDTO> getByPatient(@PathVariable String patientId) {
        return msService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/donneur/{donorId}")
    public ResponseEntity<MicrobiologieSerologieDTO> getByDonneur(@PathVariable Integer donorId) {
        return msService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<MicrobiologieSerologieDTO> save(@PathVariable String patientId, @RequestBody @jakarta.validation.Valid MicrobiologieSerologie ms) {
        MicrobiologieSerologie saved = msService.createOrUpdate(patientId, ms);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    public ResponseEntity<MicrobiologieSerologieDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody @jakarta.validation.Valid MicrobiologieSerologie ms) {
        MicrobiologieSerologie saved = msService.createOrUpdateForDonor(donorId, ms);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        msService.delete(id);
        return ResponseEntity.noContent().build();
    }
}