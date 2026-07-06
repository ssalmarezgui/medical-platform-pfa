package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.NephropathieInitialeDTO;
import com.pfa.medical_backend.entities.NephropathieInitiale;
import com.pfa.medical_backend.services.NephropathieInitialeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/nephropathies")
public class NephropathieInitialeController {

    private final NephropathieInitialeService niService;

    public NephropathieInitialeController(NephropathieInitialeService niService) {
        this.niService = niService;
    }

    private NephropathieInitialeDTO toDTO(NephropathieInitiale ni) {
        NephropathieInitialeDTO dto = new NephropathieInitialeDTO();
        dto.setIdentifiantNI(ni.getIdentifiantNI());
        dto.setTypeCliniqueNI(ni.getTypeCliniqueNI());
        dto.setCauseNI(ni.getCauseNI());
        dto.setTypeHistologiqueNI(ni.getTypeHistologiqueNI());
        dto.setStadeMaladiNI(ni.getStadeMaladiNI());
        if (ni.getPatient() != null) {
            dto.setPatientId(ni.getPatient().getIdentifiantP());
        }
        return dto;
    }

    private NephropathieInitiale toEntity(NephropathieInitialeDTO dto) {
        NephropathieInitiale ni = new NephropathieInitiale();
        ni.setIdentifiantNI(dto.getIdentifiantNI());
        ni.setTypeCliniqueNI(dto.getTypeCliniqueNI());
        ni.setCauseNI(dto.getCauseNI());
        ni.setTypeHistologiqueNI(dto.getTypeHistologiqueNI());
        ni.setStadeMaladiNI(dto.getStadeMaladiNI());
        return ni;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<NephropathieInitialeDTO> getAll(@RequestParam(required = false) String patientId) {
        List<NephropathieInitiale> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? niService.getByPatient(patientId) 
            : niService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<NephropathieInitialeDTO> getById(@PathVariable Integer id) {
        return niService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<NephropathieInitialeDTO> create(@PathVariable String patientId, @RequestBody NephropathieInitialeDTO dto) {
        NephropathieInitiale created = niService.create(toEntity(dto), patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<NephropathieInitialeDTO> update(@PathVariable Integer id, @RequestBody NephropathieInitialeDTO detailsDto) {
        NephropathieInitiale updated = niService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        niService.delete(id);
        return ResponseEntity.noContent().build();
    }
}