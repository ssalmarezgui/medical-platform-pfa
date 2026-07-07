package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.MedicamentLongCoursDTO;
import com.pfa.medical_backend.entities.MedicamentLongCours;
import com.pfa.medical_backend.services.MedicamentLongCoursService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicaments-long-cours")
public class MedicamentLongCoursController {

    private final MedicamentLongCoursService mlcService;

    public MedicamentLongCoursController(MedicamentLongCoursService mlcService) {
        this.mlcService = mlcService;
    }

    private MedicamentLongCoursDTO toDTO(MedicamentLongCours mlc) {
        MedicamentLongCoursDTO dto = new MedicamentLongCoursDTO();
        dto.setIdentifiantMLC(mlc.getIdentifiantMLC());
        dto.setLibelleMLC(mlc.getLibelleMLC());
        dto.setMolecule(mlc.getMolecule());
        dto.setIndication(mlc.getIndication());
        dto.setDebutTraitement(mlc.getDebutTraitement());
        
        if (mlc.getPatient() != null) {
            dto.setPatientId(mlc.getPatient().getIdentifiantP());
        }

        if (mlc.getDonneur() != null) {
            dto.setDonorId(mlc.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    private MedicamentLongCours toEntity(MedicamentLongCoursDTO dto) {
        MedicamentLongCours mlc = new MedicamentLongCours();
        mlc.setIdentifiantMLC(dto.getIdentifiantMLC());
        mlc.setLibelleMLC(dto.getLibelleMLC());
        mlc.setMolecule(dto.getMolecule());
        mlc.setIndication(dto.getIndication());
        mlc.setDebutTraitement(dto.getDebutTraitement());
        return mlc;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<MedicamentLongCoursDTO> getAll(@RequestParam(required = false) String patientId) {
        List<MedicamentLongCours> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? mlcService.getByPatient(patientId) 
            : mlcService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<MedicamentLongCoursDTO> getById(@PathVariable Integer id) {
        return mlcService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<MedicamentLongCoursDTO> create(@PathVariable String patientId, @RequestBody MedicamentLongCoursDTO dto) {
        MedicamentLongCours created = mlcService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<MedicamentLongCoursDTO> createForDonor(@PathVariable Integer donorId, @RequestBody MedicamentLongCoursDTO dto) {
        MedicamentLongCours created = mlcService.createForDonor(toEntity(dto), donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<MedicamentLongCoursDTO> update(@PathVariable Integer id, @RequestBody MedicamentLongCoursDTO detailsDto) {
        MedicamentLongCours updated = mlcService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        mlcService.delete(id);
        return ResponseEntity.noContent().build();
    }
}