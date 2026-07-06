package com.pfa.medical_backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.pfa.medical_backend.dto.HopitalDTO;
import com.pfa.medical_backend.dto.ServiceDTO;
import com.pfa.medical_backend.entities.HopitalStructureSoin;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.services.HopitalService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hopitaux")
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class HopitalController {

    private final HopitalService hopitalService;

    public HopitalController(HopitalService hopitalService) {
        this.hopitalService = hopitalService;
    }

    private HopitalDTO toHopitalDTO(HopitalStructureSoin h) {
        HopitalDTO dto = new HopitalDTO();
        dto.setIdentifiantH(h.getIdentifiantH());
        dto.setLibelleH(h.getLibelleH());
        dto.setAdresseH(h.getAdresseH());
        dto.setNbLitsH(h.getNbLitsH());
        dto.setNbServiceH(h.getNbServiceH());
        return dto;
    }

    private HopitalStructureSoin toHopitalEntity(HopitalDTO dto) {
        HopitalStructureSoin h = new HopitalStructureSoin();
        h.setIdentifiantH(dto.getIdentifiantH());
        h.setLibelleH(dto.getLibelleH());
        h.setAdresseH(dto.getAdresseH());
        h.setNbLitsH(dto.getNbLitsH());
        h.setNbServiceH(dto.getNbServiceH());
        return h;
    }

    private ServiceDTO toServiceDTO(ServiceMedical s) {
        ServiceDTO dto = new ServiceDTO();
        dto.setIdentifiantS(s.getIdentifiantS());
        dto.setLibelleS(s.getLibelleS());
        dto.setNbLitsS(s.getNbLitsS());
        dto.setNbMedecinsS(s.getNbMedecinsS());
        if (s.getHopital() != null) {
            dto.setHopitalId(s.getHopital().getIdentifiantH());
            dto.setHopitalLibelle(s.getHopital().getLibelleH());
        }
        return dto;
    }

    private ServiceMedical toServiceEntity(ServiceDTO dto) {
        ServiceMedical s = new ServiceMedical();
        s.setIdentifiantS(dto.getIdentifiantS());
        s.setLibelleS(dto.getLibelleS());
        s.setNbLitsS(dto.getNbLitsS());
        s.setNbMedecinsS(dto.getNbMedecinsS());
        return s;
    }

    @GetMapping("/public")
    public List<HopitalDTO> getAllPublic() {
        log.info("Consultation publique de la liste des hôpitaux pour le login");
        return hopitalService.getAllHopitaux().stream()
                .map(this::toHopitalDTO)
                .toList();
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_HOPITAL')")
    public List<HopitalDTO> getAll() {
        log.info("Consultation de la liste des hôpitaux");
        return hopitalService.getAllHopitaux().stream()
                .map(this::toHopitalDTO)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_HOPITAL')")
    public ResponseEntity<HopitalDTO> getById(@PathVariable String id){
        return hopitalService.getHopitalById(id)
            .map(this::toHopitalDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<HopitalDTO> create(@Valid @RequestBody HopitalDTO dto) {
        log.info("Création d'un nouvel hôpital : {}", dto.getLibelleH());
        HopitalStructureSoin created = hopitalService.createHopital(toHopitalEntity(dto));
        return new ResponseEntity<>(toHopitalDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<HopitalDTO> update(@PathVariable String id, @RequestBody HopitalDTO detailsDto) {
        HopitalStructureSoin updated = hopitalService.updateHopital(id, toHopitalEntity(detailsDto));
        return ResponseEntity.ok(toHopitalDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_HOPITAL')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        hopitalService.deleteHopital(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{hopitalId}/services")
    @PreAuthorize("hasAuthority('READ_SERVICE')") 
    public ResponseEntity<List<ServiceDTO>> getServicesOfHopital(@PathVariable String hopitalId) {
        try {
            List<ServiceDTO> services = hopitalService.getServicesOfHopital(hopitalId).stream()
                    .map(this::toServiceDTO)
                    .toList();
            return ResponseEntity.ok(services);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{hopitalId}/services")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<Object> ajouterServiceAHopital(
        @PathVariable String hopitalId,
        @RequestBody ServiceDTO serviceDto
    ) {
        try {
            HopitalStructureSoin updatedHopital = hopitalService.ajouterServiceAHopital(hopitalId, toServiceEntity(serviceDto));
            
            return ResponseEntity.ok(toHopitalDTO(updatedHopital));
        } catch (Exception e) {
            log.error("Erreur ajout service hopital id={}", hopitalId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur lors de l'ajout du service"));
        }
    }

    @DeleteMapping("/{hopitalId}/services/{serviceId}")
    @PreAuthorize("hasAuthority('WRITE_SERVICE')")
    public ResponseEntity<Object> retirerServiceDeHopital(
        @PathVariable String hopitalId,
        @PathVariable Integer serviceId
    ) {
        try {
            HopitalStructureSoin updated = hopitalService.retirerServiceDeHopital(hopitalId, serviceId);
            return ResponseEntity.ok(toHopitalDTO(updated));
        } catch (Exception e) {
            log.error("Erreur retrait service hopital id={} serviceId={}", hopitalId, serviceId, e);
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur lors du retrait du service"));
        }
    }
}