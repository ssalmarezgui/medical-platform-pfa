package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AntecedentFamilialDTO;
import com.pfa.medical_backend.entities.AntecedentFamilial;
import com.pfa.medical_backend.services.AntecedentFamilialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/antecedents-familiaux")
@CrossOrigin(origins = "*")
public class AntecedentFamilialController {

    @Autowired
    private AntecedentFamilialService afService;

    // Convertisseur d'Entité vers DTO
    private AntecedentFamilialDTO toDTO(AntecedentFamilial af) {
        AntecedentFamilialDTO dto = new AntecedentFamilialDTO();
        dto.setIdentifiantAF(af.getIdentifiantAF());
        dto.setTypeRelation(af.getTypeRelation());
        dto.setDateDeNaissance(af.getDateDeNaissance());
        dto.setProfession(af.getProfession());
        dto.setTares(af.getTares());
        dto.setConsanguinite(af.getConsanguinite());

        if (af.getPatient() != null) {
            dto.setPatientId(af.getPatient().getIdentifiantP());
        }

        if (af.getDonneur() != null) {
            dto.setDonorId(af.getDonneur().getIdentifiantD());
        }
        return dto;
    }

    @GetMapping
    public List<AntecedentFamilialDTO> getAll(
        @RequestParam(required = false) String patientId,
        @RequestParam(required = false) Integer donorId

    ) {
        // Sécurisation contre les chaînes de caractères vides
        List<AntecedentFamilial> list ;
        if (patientId != null && !patientId.trim().isEmpty()) {
            list = afService.getByPatient(patientId);
        } else if (donorId != null){
            list = afService.getByDonneur(donorId);

        } else {
            list = afService.getAll();

        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AntecedentFamilialDTO> getById(@PathVariable Integer id) {
        return afService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<AntecedentFamilialDTO> create(@PathVariable String patientId, @RequestBody AntecedentFamilial af) {
        AntecedentFamilial created = afService.create(af, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    public ResponseEntity<AntecedentFamilialDTO> createForDonor(@PathVariable Integer donorId, @RequestBody AntecedentFamilial af) {
        AntecedentFamilial created = afService.createForDonor(af, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AntecedentFamilialDTO> update(@PathVariable Integer id, @RequestBody AntecedentFamilial details) {
        AntecedentFamilial updated = afService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        afService.delete(id);
        return ResponseEntity.noContent().build();
    }
}