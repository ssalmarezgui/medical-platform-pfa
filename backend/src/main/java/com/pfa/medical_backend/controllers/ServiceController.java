package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.ServiceDTO;
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
public class ServiceController {

    private final ServiceHospitalierService serviceHospitalierService;

    public ServiceController(ServiceHospitalierService serviceHospitalierService) {
        this.serviceHospitalierService = serviceHospitalierService;
    }

    private ServiceDTO toServiceDTO(ServiceMedical s) {
        ServiceDTO dto = new ServiceDTO();
        dto.setIdentifiantS(s.getIdentifiantS());
        dto.setLibelleS(s.getLibelleS());
        dto.setNbLitsS(s.getNbLitsS());
        dto.setNbChambresS(s.getNbChambresS());
        dto.setNbMedecinsS(s.getNbMedecinsS());
        
        if (s.getHopital() != null) {
            dto.setIdHopital(s.getHopital().getIdentifiantH());
            dto.setHopitalLibelle(s.getHopital().getLibelleH());
        } else if (s.getIdHopital() != null) {
            dto.setIdHopital(s.getIdHopital());
        }
        return dto;
    }

    private ServiceMedical toServiceEntity(ServiceDTO dto) {
        ServiceMedical s = new ServiceMedical();
        s.setIdentifiantS(dto.getIdentifiantS());
        s.setLibelleS(dto.getLibelleS());
        s.setNbLitsS(dto.getNbLitsS());
        s.setNbChambresS(dto.getNbChambresS());
        s.setNbMedecinsS(dto.getNbMedecinsS());
        return s;
    }

    @GetMapping("/public")
    public List<ServiceDTO> getPublicServices(@RequestParam String hopitalId) {
        log.info("Consultation publique de la liste des services pour l'hôpital {}", hopitalId);
        return serviceHospitalierService.getServicesByHopital(hopitalId).stream()
                .map(this::toServiceDTO)
                .toList();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_SERVICE')")
    public List<ServiceDTO> getAll(@RequestParam(required = false) String hopitalId) { 
        List<ServiceMedical> list;
        if (hopitalId != null) {
            list = serviceHospitalierService.getServicesByHopital(hopitalId);
        } else {
            list = serviceHospitalierService.getAllServices();
        }
        return list.stream().map(this::toServiceDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_SERVICE')")
    public ResponseEntity<ServiceDTO> getById(@PathVariable Integer id) {
        return serviceHospitalierService.getServiceById(id)
                .map(this::toServiceDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hopital/{hopitalId}")
    @PreAuthorize("hasAuthority('READ_SERVICE')")
    public List<ServiceDTO> getByHopital(@PathVariable String hopitalId) { 
        return serviceHospitalierService.getServicesByHopital(hopitalId).stream()
                .map(this::toServiceDTO)
                .toList();
    }

    @PostMapping("/hopital/{hopitalId}")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<ServiceDTO> create(@PathVariable String hopitalId, @RequestBody ServiceDTO serviceDto) { 
        log.info("Création du service {} pour l'hôpital {}", serviceDto.getLibelleS(), hopitalId);
        ServiceMedical created = serviceHospitalierService.createService(toServiceEntity(serviceDto), hopitalId);
        return new ResponseEntity<>(toServiceDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<ServiceDTO> update(@PathVariable Integer id, @RequestBody ServiceDTO detailsDto) {
        ServiceMedical updated = serviceHospitalierService.updateService(id, toServiceEntity(detailsDto));
        return ResponseEntity.ok(toServiceDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.warn("Suppression du service ID : {}", id);
        serviceHospitalierService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // GESTION DES ACCES

    @GetMapping("/{serviceId}/users")
    @PreAuthorize("hasAuthority('READ_SERVICE')")
    public List<User> getUsersByService(@PathVariable Integer serviceId) {
        return serviceHospitalierService.getUsersByService(serviceId);
    }

    @PostMapping("/{serviceId}/users/{userId}")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<ServiceDTO> assignUser(@PathVariable Integer serviceId, @PathVariable Integer userId) {
        ServiceMedical updatedService = serviceHospitalierService.assignerUtilisateurAuService(serviceId, userId);
        return ResponseEntity.ok(toServiceDTO(updatedService));
    }
}