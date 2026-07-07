package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.HormonesVitaminesService;
import com.pfa.medical_backend.repositories.HormonesVitaminesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hormones-vitamines")
public class HormonesVitaminesController {

    private final HormonesVitaminesService hvService;
    private final HormonesVitaminesRepository hvRepository;

    public HormonesVitaminesController(
        HormonesVitaminesService hvService,
        HormonesVitaminesRepository hvRepository
    ) {
        this.hvService = hvService;
        this.hvRepository = hvRepository;
    }

    private HormonesVitaminesDTO toDTO(HormonesVitamines hv) {
        HormonesVitaminesDTO dto = new HormonesVitaminesDTO();
        dto.setIdentifiantHV(hv.getIdentifiantHV());
        dto.setTypeHV(hv.getTypeHV());
        
        if (hv.getPatient() != null) {
            dto.setPatientId(hv.getPatient().getIdentifiantP());
        }
        
        if (hv.getDonneur() != null) {
            dto.setDonorId(hv.getDonneur().getIdentifiantD());
        }
        
        if (hv.getAnalyses() != null) {
            List<AnalyseDTO> list = hv.getAnalyses().stream().map(a -> {
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

    private HormonesVitamines toEntity(HormonesVitaminesDTO dto) {
        HormonesVitamines hv = new HormonesVitamines();
        hv.setIdentifiantHV(dto.getIdentifiantHV());
        hv.setTypeHV(dto.getTypeHV());
        
        if (dto.getAnalyses() != null) {
            List<Analyse> list = dto.getAnalyses().stream().map(a -> {
                Analyse ana = new Analyse();
                ana.setIdentifiantAna(a.getIdentifiantAna());
                ana.setDateAna(a.getDateAna());
                ana.setResultatAna(a.getResultatAna());
                ana.setValeurAna(a.getValeurAna());
                ana.setTypeAnalyse(a.getTypeAnalyse());
                return ana;
            }).toList();
            hv.setAnalyses(list);
        }
        return hv;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public ResponseEntity<List<HormonesVitaminesDTO>> getAll(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) Integer donorId
    ) {
        List<HormonesVitamines> list;
        
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = hvService.getByPatient(patientId).map(List::of).orElse(List.of());
        } else if (donorId != null) {
            list = hvService.getByDonneur(donorId).map(List::of).orElse(List.of());
        } else {
            list = hvRepository.findAll();
        }

        List<HormonesVitaminesDTO> dtos = list.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<HormonesVitaminesDTO> getByPatient(@PathVariable String patientId) {
        return hvService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<HormonesVitaminesDTO> saveForPatient(@PathVariable String patientId, @RequestBody HormonesVitaminesDTO dto) {
        HormonesVitamines saved = hvService.createOrUpdate(patientId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    public ResponseEntity<HormonesVitaminesDTO> getByDonor(@PathVariable Integer donorId) {
        return hvService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<HormonesVitaminesDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody HormonesVitaminesDTO dto) {
        HormonesVitamines saved = hvService.createOrUpdateForDonor(donorId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hvService.delete(id);
        return ResponseEntity.noContent().build();
    }
}