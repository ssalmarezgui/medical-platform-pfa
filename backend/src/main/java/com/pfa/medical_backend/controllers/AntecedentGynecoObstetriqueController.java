package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentGynecoObstetriqueDTO;
import com.pfa.medical_backend.entities.AntecedentGynecoObstetrique;
import com.pfa.medical_backend.services.AntecedentGynecoObstetriqueService;
import com.pfa.medical_backend.repositories.AntecedentGynecoObstetriqueRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/antecedents-gyneco")
public class AntecedentGynecoObstetriqueController {

    private final AntecedentGynecoObstetriqueService agoService;
    private final AntecedentGynecoObstetriqueRepository agoRepository;

    public AntecedentGynecoObstetriqueController(
        AntecedentGynecoObstetriqueService agoService,
        AntecedentGynecoObstetriqueRepository agoRepository
    ) {
        this.agoService = agoService;
        this.agoRepository = agoRepository;
    }

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

    private AntecedentGynecoObstetrique toEntity(AntecedentGynecoObstetriqueDTO dto) {
        AntecedentGynecoObstetrique ago = new AntecedentGynecoObstetrique();
        ago.setIdentifiantAGO(dto.getIdentifiantAGO());
        ago.setDatePremieresRegles(dto.getDatePremieresRegles());
        ago.setMenopause(dto.getMenopause());
        ago.setGrossessesNombreTotal(dto.getGrossessesNombreTotal());
        ago.setGrossessesAvortementsProvoques(dto.getGrossessesAvortementsProvoques());
        ago.setGrossessesPreeclampsie(dto.getGrossessesPreeclampsie());
        ago.setGrossessesAccouchementsPrematures(dto.getGrossessesAccouchementsPrematures());
        ago.setGrossessesAvortementsSpontanes(dto.getGrossessesAvortementsSpontanes());
        ago.setGrossessesCesarienne(dto.getGrossessesCesarienne());
        ago.setContraceptionMethodes(dto.getContraceptionMethodes());
        ago.setContraceptionDuree(dto.getContraceptionDuree());
        ago.setPathologieMammaireGyneco(dto.getPathologieMammaireGyneco());
        return ago;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<AntecedentGynecoObstetriqueDTO> getAll() {        
        return agoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
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
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> create(@PathVariable String patientId, @RequestBody AntecedentGynecoObstetriqueDTO dto) {
        AntecedentGynecoObstetrique created = agoService.create(toEntity(dto), patientId);
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
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentGynecoObstetriqueDTO dto) {
        AntecedentGynecoObstetrique created = agoService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<AntecedentGynecoObstetriqueDTO> update(@PathVariable Integer id, @RequestBody AntecedentGynecoObstetriqueDTO detailsDto) {
        AntecedentGynecoObstetrique updated = agoService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        agoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}