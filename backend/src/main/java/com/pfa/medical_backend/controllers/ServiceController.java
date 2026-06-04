package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.services.ServiceHospitalierService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@Slf4j
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceHospitalierService serviceHospitalierService;

    public ServiceController(ServiceHospitalierService serviceHospitalierService) {
        this.serviceHospitalierService = serviceHospitalierService;
    }

   
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_INVESTIGATEUR')")
    public List<ServiceMedical> getAll(@RequestParam(required = false) String hopitalId) { 
        if (hopitalId != null) {
            return serviceHospitalierService.getServicesByHopital(hopitalId);
        }
        return serviceHospitalierService.getAllServices();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<ServiceMedical> getById(@PathVariable Integer id) {
   
        return serviceHospitalierService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/hopital/{hopitalId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_INVESTIGATEUR')")
    public List<ServiceMedical> getByHopital(@PathVariable String hopitalId) { 
        return serviceHospitalierService.getServicesByHopital(hopitalId);
    }

    @PostMapping("/hopital/{hopitalId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ServiceMedical> create(@PathVariable String hopitalId, @RequestBody ServiceMedical service) { 
        log.info("Création du service {} pour l'hôpital {}", service.getLibelleS(), hopitalId);
        return new ResponseEntity<>(serviceHospitalierService.createService(service, hopitalId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ServiceMedical update(@PathVariable Integer id, @RequestBody ServiceMedical details) {
        return serviceHospitalierService.updateService(id, details);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.warn("Suppression du service ID : {}", id);
        serviceHospitalierService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // GESTION DES ACCES

    @GetMapping("/{serviceId}/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<User> getUsersByService(@PathVariable Integer serviceId) {
        return serviceHospitalierService.getUsersByService(serviceId);
    }

    @PostMapping("/{serviceId}/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ServiceMedical assignUser(@PathVariable Integer serviceId, @PathVariable Integer userId) {
        return serviceHospitalierService.assignerUtilisateurAuService(serviceId, userId);
    }
}