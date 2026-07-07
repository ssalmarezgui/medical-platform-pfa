package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.DosageMedSangDTO;
import com.pfa.medical_backend.entities.DosageMedSang;
import com.pfa.medical_backend.services.DosageMedSangService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dosages-sanguins")
public class DosageMedSangController {

    private final DosageMedSangService dmsService;

    public DosageMedSangController(DosageMedSangService dmsService) {
        this.dmsService = dmsService;
    }

    private DosageMedSangDTO toDTO(DosageMedSang dms) {
        DosageMedSangDTO dto = new DosageMedSangDTO();
        dto.setIdentifiantDMS(dms.getIdentifiantDMS());
        dto.setDateDMS(dms.getDateDMS());
        dto.setLabelDMS(dms.getLabelDMS());
        dto.setValeurDMS(dms.getValeurDMS());
        dto.setObservationDMS(dms.getObservationDMS());
        if (dms.getTraitement() != null) {
            dto.setTraitementId(dms.getTraitement().getIdentifiantTIS());
        }
        return dto;
    }

    private DosageMedSang toEntity(DosageMedSangDTO dto) {
        DosageMedSang dms = new DosageMedSang();
        dms.setIdentifiantDMS(dto.getIdentifiantDMS());
        dms.setDateDMS(dto.getDateDMS());
        dms.setLabelDMS(dto.getLabelDMS());
        dms.setValeurDMS(dto.getValeurDMS());
        dms.setObservationDMS(dto.getObservationDMS());
        return dms;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_IMMUNO')")
    public List<DosageMedSangDTO> getAll(@RequestParam(required = false) Integer traitementId) {
        List<DosageMedSang> list = (traitementId != null) 
            ? dmsService.getByTraitement(traitementId) 
            : dmsService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_IMMUNO')") 
    public ResponseEntity<DosageMedSangDTO> getById(@PathVariable Integer id) {
        return dmsService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/traitement/{traitementId}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<DosageMedSangDTO> create(
            @PathVariable Integer traitementId, 
            @RequestBody DosageMedSangDTO dto) {
        DosageMedSang created = dmsService.create(toEntity(dto), traitementId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_IMMUNO', 'WRITE_IMMUNO_COMPLICATION')")
    public ResponseEntity<DosageMedSangDTO> update(@PathVariable Integer id, @RequestBody DosageMedSangDTO detailsDto) {
        DosageMedSang updated = dmsService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_IMMUNO')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        dmsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}