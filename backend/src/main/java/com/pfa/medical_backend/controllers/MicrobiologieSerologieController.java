package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.MicrobiologieSerologieRepository;
import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.MicrobiologieSerologieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/microbiologie")
public class MicrobiologieSerologieController {

    @Autowired
    private MicrobiologieSerologieService msService;

    @Autowired
    private MicrobiologieSerologieRepository msRepository;

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
            }).toList();
            dto.setAnalyses(list);
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<MicrobiologieSerologieDTO> getAll() {
        return msRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<MicrobiologieSerologieDTO> getByPatient(@PathVariable String patientId) {
        return msService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<MicrobiologieSerologieDTO> getByDonneur(@PathVariable Integer donorId) {
        return msService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<MicrobiologieSerologieDTO> save(@PathVariable String patientId, @RequestBody @jakarta.validation.Valid MicrobiologieSerologie ms) {
        MicrobiologieSerologie saved = msService.createOrUpdate(patientId, ms);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<MicrobiologieSerologieDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody @jakarta.validation.Valid MicrobiologieSerologie ms) {
        MicrobiologieSerologie saved = msService.createOrUpdateForDonor(donorId, ms);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        msService.delete(id);
        return ResponseEntity.noContent().build();
    }
}