package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.DialyseDTO;
import com.pfa.medical_backend.entities.Dialyse;
import com.pfa.medical_backend.services.DialyseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dialyses")
public class DialyseController {

    private final DialyseService dialyseService;

    public DialyseController(DialyseService dialyseService) {
        this.dialyseService = dialyseService;
    }

    private DialyseDTO toDTO(Dialyse d) {
        DialyseDTO dto = new DialyseDTO();
        dto.setIdentifiantDia(d.getIdentifiantDia());
        dto.setTypeDialyse(d.getTypeDialyse());
        if (d.getNephropathie() != null) {
            dto.setNephropathieId(d.getNephropathie().getIdentifiantNI());
        }
        return dto;
    }

    private Dialyse toEntity(DialyseDTO dto) {
        Dialyse d = new Dialyse();
        d.setIdentifiantDia(dto.getIdentifiantDia());
        d.setTypeDialyse(dto.getTypeDialyse());
        return d;
    }

    @GetMapping
    public List<DialyseDTO> getAll(@RequestParam(required = false) Integer nephropathieId) {
        List<Dialyse> list = (nephropathieId != null) 
            ? dialyseService.getByNephropathie(nephropathieId) 
            : dialyseService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DialyseDTO> getById(@PathVariable Integer id) {
        return dialyseService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/nephropathie/{nephropathieId}")
    public ResponseEntity<DialyseDTO> create(
            @PathVariable Integer nephropathieId, 
            @RequestBody DialyseDTO dto) {
        Dialyse created = dialyseService.create(toEntity(dto), nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<DialyseDTO> update(@PathVariable Integer id, @RequestBody DialyseDTO detailsDto) {
        Dialyse updated = dialyseService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        dialyseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}