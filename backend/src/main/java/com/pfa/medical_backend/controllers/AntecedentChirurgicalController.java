package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentChirurgicalDTO;
import com.pfa.medical_backend.entities.AntecedentChirurgical;
import com.pfa.medical_backend.services.AntecedentChirurgicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/antecedents-chirurgicaux")
public class AntecedentChirurgicalController {

    @Autowired
    private AntecedentChirurgicalService acService;

    private AntecedentChirurgicalDTO toDTO(AntecedentChirurgical ac) {
        AntecedentChirurgicalDTO dto = new AntecedentChirurgicalDTO();
        dto.setIdentifiantACH(ac.getIdentifiantACH());
        dto.setIntervention(ac.getIntervention());
        dto.setDate(ac.getDate());
        dto.setLieu(ac.getLieu());
        dto.setChirurgien(ac.getChirurgien());
        dto.setEvolution(ac.getEvolution());

        if (ac.getPatient() != null) {
            dto.setPatientId(ac.getPatient().getIdentifiantP());
        }

        if (ac.getDonneur() != null) {
            dto.setDonorId(ac.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<AntecedentChirurgicalDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId
    ) {
        List<AntecedentChirurgical> list; 
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = acService.getByPatient(patientId);
        } else if (donorId != null){
            list = acService.getByDonneur(donorId);
        } else {
            list = acService.getAll();
        }
        
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')") 
    public ResponseEntity<AntecedentChirurgicalDTO> getById(@PathVariable Integer id) {
        return acService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<AntecedentChirurgicalDTO> create(@PathVariable String patientId, @RequestBody AntecedentChirurgical ac) {
        AntecedentChirurgical created = acService.create(ac, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    @PreAuthorize("hasAuthority('WRITE_DONNEUR')")
    public ResponseEntity<AntecedentChirurgicalDTO> create(@PathVariable Integer donorId, @RequestBody AntecedentChirurgical ac) {
        AntecedentChirurgical created = acService.createForDonor(ac, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<AntecedentChirurgicalDTO> update(@PathVariable Integer id, @RequestBody AntecedentChirurgical details) {
        AntecedentChirurgical updated = acService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        acService.delete(id);
        return ResponseEntity.noContent().build();
    }
}