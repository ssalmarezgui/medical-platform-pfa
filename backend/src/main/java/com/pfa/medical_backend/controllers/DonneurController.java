package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.DonneurDTO;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.services.DonneurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donneurs")
public class DonneurController {

    private final DonneurService donneurService;

    public DonneurController(DonneurService donneurService) {
        this.donneurService = donneurService;
    }

    private DonneurDTO toDTO(Donneur d) {
        DonneurDTO dto = new DonneurDTO();
        dto.setIdentifiantD(d.getIdentifiantD());
        dto.setIndexHopitalD(d.getIndexHopitalD());
        
        if (d.getCinD() != null && !d.getCinD().trim().isEmpty()) {
            try {
                dto.setNumeroCin(Integer.parseInt(d.getCinD().trim()));
            } catch (NumberFormatException e) {
                dto.setNumeroCin(null);
            }
        }

        dto.setNomD(d.getNomD());
        dto.setPrenomD(d.getPrenomD());
        dto.setDateNaissD(d.getDateNaissD());
        dto.setSexeD(d.getSexeD());
        dto.setNationaliteD(d.getNationaliteD());
        dto.setOrigineGeogD(d.getOrigineGeogD());
        
        dto.setAdresseD(d.getAdresseDomD());
        
        dto.setTelephoneD(d.getTelephoneD());
        
        dto.setAdressEmailD(d.getAdresseEmailD());
        
        dto.setTelephoneWhatsAppD(d.getTelephoneWhatsAppD());
        dto.setPersonneAcontacterD(d.getPersonneAcontacterD());
        dto.setTypeCarnetD(d.getTypeCarnetD());
        dto.setNumCarnetD(d.getNumCarnetD());
        dto.setAdulteD(d.getAdulteD());
        dto.setStatut(d.getStatut());
        
        dto.setEvolution(d.getEvolutionProf());
        
        dto.setNiveauEducation(d.getNiveauEducation());
        dto.setEnEtatActivite(d.getEnEtatActivite());
        dto.setTypeDonneur(d.getTypeDonneur());
        return dto;
    }

    private Donneur toEntity(DonneurDTO dto) {
        Donneur d = new Donneur();
        d.setIdentifiantD(dto.getIdentifiantD());
        d.setIndexHopitalD(dto.getIndexHopitalD());
        
        if (dto.getNumeroCin() != null) {
            d.setCinD(String.valueOf(dto.getNumeroCin()));
        }

        d.setNomD(dto.getNomD());
        d.setPrenomD(dto.getPrenomD());
        d.setDateNaissD(dto.getDateNaissD());
        d.setSexeD(dto.getSexeD());
        d.setNationaliteD(dto.getNationaliteD());
        d.setOrigineGeogD(dto.getOrigineGeogD());
        
        d.setAdresseDomD(dto.getAdresseD());
        
        d.setTelephoneD(dto.getTelephoneD());
        
        d.setAdresseEmailD(dto.getAdressEmailD());
        
        d.setTelephoneWhatsAppD(dto.getTelephoneWhatsAppD());
        d.setPersonneAcontacterD(dto.getPersonneAcontacterD());
        d.setTypeCarnetD(dto.getTypeCarnetD());
        d.setNumCarnetD(dto.getNumCarnetD());
        d.setAdulteD(dto.getAdulteD());
        d.setStatut(dto.getStatut());
        
        d.setEvolutionProf(dto.getEvolution());
        
        d.setNiveauEducation(dto.getNiveauEducation());
        d.setEnEtatActivite(dto.getEnEtatActivite());
        d.setTypeDonneur(dto.getTypeDonneur());
        return d;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_DONNEUR')") 
    public List<DonneurDTO> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(name = "hopitalId", required = false) String hopitalId) {
        
        List<Donneur> list;
        if (type != null) {
            list = donneurService.getByType(type);
        } else {
            list = donneurService.getAll(hopitalId);
        }
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_DONNEUR')")
    public ResponseEntity<DonneurDTO> getById(@PathVariable Integer id) {
        return donneurService.getById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('WRITE_DONNEUR')")
    public ResponseEntity<DonneurDTO> create(@RequestBody DonneurDTO dto) {
        Donneur created = donneurService.create(toEntity(dto));
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_DONNEUR')")
    public ResponseEntity<DonneurDTO> update(@PathVariable Integer id, @RequestBody DonneurDTO detailsDto) {
        Donneur updated = donneurService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_DONNEUR')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        donneurService.delete(id);
        return ResponseEntity.noContent().build();
    }
}