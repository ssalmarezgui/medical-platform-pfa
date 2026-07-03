package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentGynecoObstetriqueDTO;
import com.pfa.medical_backend.entities.AntecedentGynecoObstetrique;
import com.pfa.medical_backend.services.AntecedentGynecoObstetriqueService;
import com.pfa.medical_backend.repositories.AntecedentGynecoObstetriqueRepository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/antecedents-gyneco")
public class AntecedentGynecoObstetriqueController {

    @Autowired
    private AntecedentGynecoObstetriqueService agoService;

    @Autowired
    private AntecedentGynecoObstetriqueRepository agoRepository;

    private AntecedentGynecoObstetriqueDTO toDTO(AntecedentGynecoObstetrique ago) {
        AntecedentGynecoObstetriqueDTO dto = new AntecedentGynecoObstetriqueDTO();
        dto.setIdentifiantAGO(ago.getIdentifiantAGO());
        dto.setDatePremieresRegles(ago.getDatePremieresRegles());
        dto.setMenopause(ago.getMenopause());
        dto.setGrossessesNombreTotal(ago.getGrossessesNombreTotal());
        dto.setGrossessesAvortementsProvoques(ago.getGrossessesAvortementsProvoques());
        dto.setGrossessesPreeclampsie(ago.getGrossessesPreeclampsie());
        dto.setGrossessesAccouchementsPrematures(ago.getGrossessesAccouchementsPrematures());
        dto.setGrossessesAvortementsSpontanes(ago.getGrossessesAvortementsSpontanes());
        dto.setGrossessesCesarienne(ago.getGrossessesCesarienne());
        dto.setContraceptionMethodes(ago.getContraceptionMethodes());
        dto.setContraceptionDuree(ago.getContraceptionDuree());
        dto.setPathologieMammaireGyneco(ago.getPathologieMammaireGyneco());
        if (ago.getPatient() != null) {
            dto.setPatientId(ago.getPatient().getIdentifiantP());
        }
        if (ago.getDonneur() != null) {
            dto.setDonorId(ago.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<AntecedentGynecoObstetriqueDTO> getAll() {        
        return agoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> getByPatient(@PathVariable String patientId) {
        return agoService.getByPatient(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> create(@PathVariable String patientId, @RequestBody AntecedentGynecoObstetrique ago) {
        AntecedentGynecoObstetrique created = agoService.create(ago, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @GetMapping("/donneur/{donorId}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> getByDonneur(@PathVariable Integer donorId) {
        return agoService.getByDonneur(donorId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentGynecoObstetrique ago) {
        AntecedentGynecoObstetrique created = agoService.createForDonor(ago, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> update(@PathVariable Integer id, @RequestBody AntecedentGynecoObstetrique details) {
        AntecedentGynecoObstetrique updated = agoService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        agoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}