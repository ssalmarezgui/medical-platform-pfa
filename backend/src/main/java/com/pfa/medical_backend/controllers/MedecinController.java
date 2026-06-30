package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.services.MedecinService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/api/medecins")
public class MedecinController {

    @Autowired
    private MedecinService medecinService;


    @GetMapping
    @PreAuthorize("hasAuthority('READ_MEDECIN')")
    public List<Medecin> getAll(
            @RequestParam(required = false) Integer serviceId,
            @RequestParam(required = false) String hopitalId) {
        
        if (serviceId != null) {
            return medecinService.getMedecinsByService(serviceId);
        }
        if (hopitalId != null) {
            return medecinService.getMedecinsByHopital(hopitalId);
        }
        return medecinService.getAllMedecins();
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_MEDECIN')")
    public ResponseEntity<Medecin> getById(@PathVariable Integer id) {
        return medecinService.getMedecinById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<Medecin> create(@RequestBody Medecin medecin) {
        return new ResponseEntity<>(medecinService.createMedecin(medecin), HttpStatus.CREATED);
    }


    @PutMapping("/{id}")

    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public Medecin update(@PathVariable Integer id, @RequestBody Medecin details) {
        return medecinService.updateMedecin(id, details);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        medecinService.deleteMedecin(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{medecinId}/services/{serviceId}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public Medecin assignerAuService(
            @PathVariable Integer medecinId,
            @PathVariable Integer serviceId) {
        return medecinService.assignerMedecinAuService(medecinId, serviceId);
    }


    @DeleteMapping("/{medecinId}/services/{serviceId}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<Medecin> retirerMedecinDuService(
            @PathVariable Integer medecinId,
            @PathVariable Integer serviceId) {
        try {
            Medecin medecin = medecinService.retirerMedecinDuService(medecinId, serviceId);
            return ResponseEntity.ok(medecin);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
