package com.pfa.medical_backend.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.pfa.medical_backend.entities.HopitalStructureSoin;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.services.HopitalService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@RestController
// @RequestMapping("/api/v1/hopitaux")
@RequestMapping("/api/hopitaux")
@Slf4j
//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
public class HopitalController {

    private final HopitalService hopitalService;

    public HopitalController(HopitalService hopitalService) {
        this.hopitalService = hopitalService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR','MEDECIN_SUIVI')")
    public List<HopitalStructureSoin> getAll() {
        log.info("Consultation de la liste des hôpitaux");
        return hopitalService.getAllHopitaux();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HopitalStructureSoin> getById(@PathVariable String id){
        return hopitalService.getHopitalById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<HopitalStructureSoin> create(@Valid @RequestBody HopitalStructureSoin h) {
        log.info("Création d'un nouvel hôpital : {}", h.getLibelleH());
        return new ResponseEntity<>(hopitalService.createHopital(h), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public HopitalStructureSoin update(@PathVariable String id, @RequestBody HopitalStructureSoin details) {
        return hopitalService.updateHopital(id, details);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        hopitalService.deleteHopital(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{hopitalId}/services")
    public ResponseEntity<List<ServiceMedical>> getServicesOfHopital(@PathVariable String hopitalId) {
        try {
            return ResponseEntity.ok(hopitalService.getServicesOfHopital(hopitalId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{hopitalId}/services")
    public ResponseEntity<?> ajouterServiceAHopital(
        @PathVariable String hopitalId,
        @RequestBody ServiceMedical service
    ) {
        try {
            return ResponseEntity.ok(hopitalService.ajouterServiceAHopital(hopitalId, service));
        } catch (Exception e) {
            log.error("Erreur ajout service hopital id={}", hopitalId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur lors de l'ajout du service"));
        }
    }

    @DeleteMapping("/{hopitalId}/services/{serviceId}")
    public ResponseEntity<?> retirerServiceDeHopital(
        @PathVariable String hopitalId,
        @PathVariable Integer serviceId
    ) {
        try {
            return ResponseEntity.ok(hopitalService.retirerServiceDeHopital(hopitalId, serviceId));
        } catch (Exception e) {
            log.error("Erreur retrait service hopital id={} serviceId={}", hopitalId, serviceId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur lors du retrait du service"));
        }
    }
}