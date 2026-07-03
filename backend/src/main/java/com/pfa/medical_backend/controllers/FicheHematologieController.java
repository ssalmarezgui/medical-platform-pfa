package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.HemotologieHemostaseRepository;
import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.FicheHematologieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hematologie")
public class FicheHematologieController {

    @Autowired
    private FicheHematologieService fhService;

    @Autowired
    private HemotologieHemostaseRepository hhRepository;

    private HemotologieHemostaseDTO toDTO(HemotologieHemostase hh) {
        HemotologieHemostaseDTO dto = new HemotologieHemostaseDTO();
        dto.setIdentifiantHH(hh.getIdentifiantHH());
        dto.setGroupeSanguin(hh.getGroupeSanguin());
        dto.setPhenotypage(hh.getPhenotypage());
        if (hh.getPatient() != null) {
            dto.setPatientId(hh.getPatient().getIdentifiantP());
        }

        if (hh.getDonneur() != null) {
            dto.setDonorId(hh.getDonneur().getIdentifiantD());
        }

        if (hh.getAnalyses() != null) {
            List<AnalyseDTO> list = hh.getAnalyses().stream().map(a -> {
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
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<HemotologieHemostaseDTO> getAll() {
        return hhRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<HemotologieHemostaseDTO> getByPatient(@PathVariable String patientId) {
        return fhService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<HemotologieHemostaseDTO> save(@PathVariable String patientId, @RequestBody HemotologieHemostase hh) {
        HemotologieHemostase saved = fhService.createOrUpdate(patientId, hh);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<HemotologieHemostaseDTO> getByDonneur(@PathVariable Integer donorId) {
        return fhService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<HemotologieHemostaseDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody HemotologieHemostase hh) {
        HemotologieHemostase saved = fhService.createOrUpdateForDonor(donorId, hh);
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        fhService.delete(id);
        return ResponseEntity.noContent().build();
    }
}