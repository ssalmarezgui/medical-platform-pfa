package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.TransplantationDTO;
import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.services.TransplantationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transplantations")
@CrossOrigin(origins = "*")
public class TransplantationController {

    @Autowired
    private TransplantationService tService;

    // Convertisseur d'Entité vers DTO
    private TransplantationDTO toDTO(Transplantation t) {
        TransplantationDTO dto = new TransplantationDTO();
        dto.setNumeroTR(t.getNumeroTR());
        dto.setDateTR(t.getDateTR());
        dto.setLieuDeLaGreffe(t.getLieuDeLaGreffe());
        dto.setLieuDeSuivi(t.getLieuDeSuivi());
        dto.setNbTransplantation(t.getNbTransplantation());
        dto.setNbUretere(t.getNbUretere());
        dto.setRein(t.getRein());
        dto.setNbArtereVeine(t.getNbArtereVeine());
        dto.setKystes(t.getKystes());
        dto.setTypeAnomalie(t.getTypeAnomalie());
        dto.setDureeIschemieFroide(t.getDureeIschemieFroide());
        dto.setDureeIschemieChaude(t.getDureeIschemieChaude());
        dto.setLiquideConservation(t.getLiquideConservation());
        dto.setLiquideRincage(t.getLiquideRincage());
        dto.setMachineAPerfusion(t.getMachineAPerfusion());
        dto.setTypeAnastomoseArterielle(t.getTypeAnastomoseArterielle());
        dto.setTypeAnastomoseVeineuse(t.getTypeAnastomoseVeineuse());
        dto.setTypeAnastomoseUreteroVesicale(t.getTypeAnastomoseUreteroVesicale());
        dto.setSondeEnDoubleJJ(t.getSondeEnDoubleJJ());
        
        if (t.getPatient() != null) {
            dto.setPatientId(t.getPatient().getIdentifiantP());
            dto.setPatientNomComplet(t.getPatient().getPrenomP() + " " + t.getPatient().getNomP());
        }
        if (t.getDonneur() != null) {
            dto.setDonneurId(t.getDonneur().getIdentifiantD());
            dto.setDonneurNomComplet(t.getDonneur().getPrenomD() + " " + t.getDonneur().getNomD());
        }
        return dto;
    }

    @GetMapping
    public List<TransplantationDTO> getAll(@RequestParam(required = false) String patientId) {
        // Sécurisation contre les chaînes de caractères vides
        List<Transplantation> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? tService.getByPatient(patientId) 
            : tService.getAll();
            
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransplantationDTO> getById(@PathVariable Integer id) {
        return tService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}/donneur/{donneurId}")
    public ResponseEntity<TransplantationDTO> create(
            @PathVariable String patientId, 
            @PathVariable Integer donneurId, 
            @RequestBody Transplantation t) {
        Transplantation created = tService.create(t, patientId, donneurId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransplantationDTO> update(@PathVariable Integer id, @RequestBody Transplantation details) {
        Transplantation updated = tService.update(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tService.delete(id);
        return ResponseEntity.noContent().build();
    }
}