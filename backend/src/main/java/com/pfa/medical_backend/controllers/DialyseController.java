package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.DialyseDTO;
import com.pfa.medical_backend.entities.Dialyse;
import com.pfa.medical_backend.services.DialyseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dialyses")
@CrossOrigin(origins = "*")
public class DialyseController {

    @Autowired
    private DialyseService dialyseService;

    // Convertisseur d'Entité vers DTO
    private DialyseDTO toDTO(Dialyse d) {
        DialyseDTO dto = new DialyseDTO();
        dto.setIdentifiantDia(d.getIdentifiantDia());
        dto.setTypeDialyse(d.getTypeDialyse());
        if (d.getNephropathie() != null) {
            dto.setNephropathieId(d.getNephropathie().getIdentifiantNI());
        }
        return dto;
    }

    @GetMapping
    public List<DialyseDTO> getAll(@RequestParam(required = false) Integer nephropathieId) {
        List<Dialyse> list = (nephropathieId != null) 
            ? dialyseService.getByNephropathie(nephropathieId) 
            : dialyseService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
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
            @RequestBody Dialyse d) {
        Dialyse created = dialyseService.create(d, nephropathieId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DialyseDTO> update(@PathVariable Integer id, @RequestBody Dialyse details) {
        Dialyse updated = dialyseService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        dialyseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}