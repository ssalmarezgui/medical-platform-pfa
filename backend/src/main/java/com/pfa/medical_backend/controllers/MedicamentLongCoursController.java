package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.MedicamentLongCoursDTO;
import com.pfa.medical_backend.entities.MedicamentLongCours;
import com.pfa.medical_backend.services.MedicamentLongCoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medicaments-long-cours")
@CrossOrigin(origins = "*")
public class MedicamentLongCoursController {

    @Autowired
    private MedicamentLongCoursService mlcService;

    // Convertisseur d'Entité vers DTO
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

    @GetMapping
    public List<MedicamentLongCoursDTO> getAll(@RequestParam(required = false) String patientId) {
        // Sécurisation contre les chaînes de caractères vides
        List<MedicamentLongCours> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? mlcService.getByPatient(patientId) 
            : mlcService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicamentLongCoursDTO> getById(@PathVariable Integer id) {
        return mlcService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<MedicamentLongCoursDTO> create(@PathVariable String patientId, @RequestBody MedicamentLongCours mlc) {
        MedicamentLongCours created = mlcService.create(mlc, patientId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PostMapping("/donneur/{donorId}")
    public ResponseEntity<MedicamentLongCoursDTO> createForDonor(@PathVariable Integer donorId, @RequestBody MedicamentLongCours mlc) {
        MedicamentLongCours created = mlcService.createForDonor(mlc, donorId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicamentLongCoursDTO> update(@PathVariable Integer id, @RequestBody MedicamentLongCours details) {
        MedicamentLongCours updated = mlcService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        mlcService.delete(id);
        return ResponseEntity.noContent().build();
    }
}