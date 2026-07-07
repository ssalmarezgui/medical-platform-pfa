package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.BilanImmunologiqueRepository;
import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.BilanImmunologiqueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/immunologie")
public class BilanImmunologiqueController {

    private final BilanImmunologiqueService biService;
    private final BilanImmunologiqueRepository biRepository;

    public BilanImmunologiqueController(
        BilanImmunologiqueService biService,
        BilanImmunologiqueRepository biRepository
    ) {
        this.biService = biService;
        this.biRepository = biRepository;
    }

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
            }).toList();
            dto.setAnalyses(list);
        }
        return dto;
    }

    private BilanImmunologique toEntity(BilanImmunologiqueDTO dto) {
        BilanImmunologique bi = new BilanImmunologique();
        bi.setIdentifiantBI(dto.getIdentifiantBI());
        bi.setTypageHLA(dto.getTypageHLA());
        bi.setBilanImmuno(dto.getBilanImmuno());
        
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
            bi.setAnalyses(list);
        }
        return bi;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<BilanImmunologiqueDTO> getAll() {
        return biRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BilanImmunologiqueDTO> getByPatient(@PathVariable String patientId) {
        return biService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BilanImmunologiqueDTO> save(@PathVariable String patientId, @RequestBody BilanImmunologiqueDTO dto) {
        BilanImmunologique saved = biService.createOrUpdate(patientId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BilanImmunologiqueDTO> getByDonneur(@PathVariable Integer donorId) {
        return biService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BilanImmunologiqueDTO> saveForDonneur(@PathVariable Integer donorId, @RequestBody BilanImmunologiqueDTO dto) {
        BilanImmunologique saved = biService.createOrUpdateForDonor(donorId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        biService.delete(id);
        return ResponseEntity.noContent().build();
    }
}