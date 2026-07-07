package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.MedicamentDTO;
import com.pfa.medical_backend.entities.Medicament;
import com.pfa.medical_backend.services.MedicamentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
public class MedicamentController {

    private final MedicamentService medicamentService;

    public MedicamentController(MedicamentService medicamentService) {
        this.medicamentService = medicamentService;
    }

    private MedicamentDTO toDTO(Medicament m) {
        MedicamentDTO dto = new MedicamentDTO();
        dto.setIdentifiantMed(m.getIdentifiantMed());
        dto.setNomCommercialMed(m.getNomCommercialMed());
        dto.setDescriptionMed(m.getDescriptionMed());
        dto.setTypeMed(m.getTypeMed());
        dto.setPosologieMed(m.getPosologieMed());
        return dto;
    }

    private Medicament toEntity(MedicamentDTO dto) {
        Medicament m = new Medicament();
        m.setIdentifiantMed(dto.getIdentifiantMed());
        m.setNomCommercialMed(dto.getNomCommercialMed());
        m.setDescriptionMed(dto.getDescriptionMed());
        m.setTypeMed(dto.getTypeMed());
        m.setPosologieMed(dto.getPosologieMed());
        return m;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public List<MedicamentDTO> getAll(@RequestParam(required = false) String type) {
        List<Medicament> list = (type != null) 
            ? medicamentService.getByType(type) 
            : medicamentService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<MedicamentDTO> getById(@PathVariable Integer id) {
        return medicamentService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<MedicamentDTO> create(@RequestBody MedicamentDTO dto) {
        Medicament created = medicamentService.create(toEntity(dto));
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<MedicamentDTO> update(@PathVariable Integer id, @RequestBody MedicamentDTO detailsDto) {
        Medicament updated = medicamentService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        medicamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}