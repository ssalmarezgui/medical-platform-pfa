package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.repositories.BiochimieSangRepository;
import com.pfa.medical_backend.dto.*;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.BiochimieSangService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/biochimie-sanguine")
public class BiochimieSangController {

    private final BiochimieSangService bsService;
    private final BiochimieSangRepository bsRepository;

    public BiochimieSangController(
        BiochimieSangService bsService,
        BiochimieSangRepository bsRepository
    ) {
        this.bsService = bsService;
        this.bsRepository = bsRepository;
    }

    private BiochimieSangDTO toDTO(BiochimieSang bs) {
        BiochimieSangDTO dto = new BiochimieSangDTO();
        dto.setIdentifiantBCS(bs.getIdentifiantBCS());
        dto.setLibelleBCS(bs.getLibelleBCS());
        dto.setDescriptionBCS(bs.getDescriptionBCS() != null ? bs.getDescriptionBCS() : "");
        
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
            }).toList();
            dto.setAnalyses(list);
        }
        return dto;
    }

    private BiochimieSang toEntity(BiochimieSangDTO dto) {
        BiochimieSang bs = new BiochimieSang();
        bs.setIdentifiantBCS(dto.getIdentifiantBCS());
        bs.setLibelleBCS(dto.getLibelleBCS());
        bs.setDescriptionBCS(dto.getDescriptionBCS());
        
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
            bs.setAnalyses(list);
        }
        return bs;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public List<BiochimieSangDTO> getAll() {
        return bsRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BiochimieSangDTO> getByPatient(@PathVariable String patientId) {
        return bsService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BiochimieSangDTO> save(@PathVariable String patientId, @RequestBody BiochimieSangDTO dto) {
        BiochimieSang saved = bsService.createOrUpdate(patientId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR', 'WRITE_LABO')")
    public ResponseEntity<BiochimieSangDTO> getByDonneur(@PathVariable Integer donorId) {
        return bsService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<BiochimieSangDTO> saveForDonor(@PathVariable Integer donorId, @RequestBody BiochimieSangDTO dto) {
        BiochimieSang saved = bsService.createOrUpdateForDonor(donorId, toEntity(dto));
        return new ResponseEntity<>(toDTO(saved), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_LABO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        bsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}