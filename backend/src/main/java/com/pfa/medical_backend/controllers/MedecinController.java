package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.MedecinDTO;
import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.services.MedecinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medecins")
public class MedecinController {

    private final MedecinService medecinService;

    public MedecinController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    private MedecinDTO toDTO(Medecin m) {
        MedecinDTO dto = new MedecinDTO();
        dto.setIdentifiantM(m.getIdentifiantM());
        dto.setNomM(m.getNomM());
        dto.setPrenomM(m.getPrenomM());
        dto.setDateNaissM(m.getDateNaissM());
        dto.setSexeM(m.getSexeM());
        dto.setNumTelM(m.getNumTelM());
        dto.setNumTelWhapAPPM(m.getNumTelWhapAPPM());
        dto.setAdresseDomM(m.getAdresseDomM());
        dto.setSpecialiteM(m.getSpecialiteM());
        dto.setDateDernierDiplomeM(m.getDateDernierDiplomeM());
        dto.setIndexHopitalM(m.getIndexHopitalM());
        dto.setAutreInfo(m.getAutreInfo());
        dto.setTypeMedecin(m.getTypeMedecin());
        if (m.getService() != null) {
            dto.setServiceId(m.getService().getIdentifiantS());
            dto.setServiceLibelle(m.getService().getLibelleS());
        }
        return dto;
    }

    private Medecin toEntity(MedecinDTO dto) {
        Medecin m = new Medecin();
        m.setIdentifiantM(dto.getIdentifiantM());
        m.setNomM(dto.getNomM());
        m.setPrenomM(dto.getPrenomM());
        m.setDateNaissM(dto.getDateNaissM());
        m.setSexeM(dto.getSexeM());
        m.setNumTelM(dto.getNumTelM());
        m.setNumTelWhapAPPM(dto.getNumTelWhapAPPM());
        m.setAdresseDomM(dto.getAdresseDomM());
        m.setSpecialiteM(dto.getSpecialiteM());
        m.setDateDernierDiplomeM(dto.getDateDernierDiplomeM());
        m.setIndexHopitalM(dto.getIndexHopitalM());
        m.setAutreInfo(dto.getAutreInfo());
        m.setTypeMedecin(dto.getTypeMedecin());
        if (dto.getServiceId() != null) {
            ServiceMedical s = new ServiceMedical();
            s.setIdentifiantS(dto.getServiceId());
            m.setService(s);
        }
        
        return m;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_MEDECIN')")
    public List<MedecinDTO> getAll(
            @RequestParam(required = false) Integer serviceId,
            @RequestParam(required = false) String hopitalId) {
        
        List<Medecin> list;
        if (serviceId != null) {
            list = medecinService.getMedecinsByService(serviceId);
        } else if (hopitalId != null) {
            list = medecinService.getMedecinsByHopital(hopitalId);
        } else {
            list = medecinService.getAllMedecins();
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_MEDECIN')")
    public ResponseEntity<MedecinDTO> getById(@PathVariable Long id) {
        return medecinService.getMedecinById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<MedecinDTO> create(@RequestBody MedecinDTO dto) {
        Medecin created = medecinService.createMedecin(toEntity(dto));
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<MedecinDTO> update(@PathVariable Long id, @RequestBody MedecinDTO detailsDto) {
        Medecin updated = medecinService.updateMedecin(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medecinService.deleteMedecin(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{medecinId}/services/{serviceId}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<MedecinDTO> assignerAuService(
            @PathVariable Long medecinId,
            @PathVariable Integer serviceId) {
        Medecin medecin = medecinService.assignerMedecinAuService(medecinId, serviceId);
        return ResponseEntity.ok(toDTO(medecin));
    }

    @DeleteMapping("/{medecinId}/services/{serviceId}")
    @PreAuthorize("hasAuthority('WRITE_MEDECIN')")
    public ResponseEntity<MedecinDTO> retirerMedecinDuService(
            @PathVariable Long medecinId,
            @PathVariable Integer serviceId) {
        try {
            Medecin medecin = medecinService.retirerMedecinDuService(medecinId, serviceId);
            return ResponseEntity.ok(toDTO(medecin));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}