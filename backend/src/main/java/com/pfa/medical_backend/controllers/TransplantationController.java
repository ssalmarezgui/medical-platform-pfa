package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.TransplantationDTO;
import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.services.TransplantationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transplantations")
public class TransplantationController {

    private final TransplantationService tService;

    public TransplantationController(TransplantationService tService) {
        this.tService = tService;
    }

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

    private Transplantation toEntity(TransplantationDTO dto) {
        Transplantation t = new Transplantation();
        t.setNumeroTR(dto.getNumeroTR());
        t.setDateTR(dto.getDateTR());
        t.setLieuDeLaGreffe(dto.getLieuDeLaGreffe());
        t.setLieuDeSuivi(dto.getLieuDeSuivi());
        t.setNbTransplantation(dto.getNbTransplantation());
        t.setNbUretere(dto.getNbUretere());
        t.setRein(dto.getRein());
        t.setNbArtereVeine(dto.getNbArtereVeine());
        t.setKystes(dto.getKystes());
        t.setTypeAnomalie(dto.getTypeAnomalie());
        t.setDureeIschemieFroide(dto.getDureeIschemieFroide());
        t.setDureeIschemieChaude(dto.getDureeIschemieChaude());
        t.setLiquideConservation(dto.getLiquideConservation());
        t.setLiquideRincage(dto.getLiquideRincage());
        t.setMachineAPerfusion(dto.getMachineAPerfusion());
        t.setTypeAnastomoseArterielle(dto.getTypeAnastomoseArterielle());
        t.setTypeAnastomoseVeineuse(dto.getTypeAnastomoseVeineuse());
        t.setTypeAnastomoseUreteroVesicale(dto.getTypeAnastomoseUreteroVesicale());
        t.setSondeEnDoubleJJ(dto.getSondeEnDoubleJJ());
        return t;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public List<TransplantationDTO> getAll(@RequestParam(required = false) String patientId) {
        List<Transplantation> list = (patientId != null && !patientId.trim().isEmpty()) 
            ? tService.getByPatient(patientId) 
            : tService.getAll();
            
        return list.stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT', 'READ_DONNEUR')")
    public ResponseEntity<TransplantationDTO> getById(@PathVariable Integer id) {
        return tService.getById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/patient/{patientId}/donneur/{donneurId}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')")
    public ResponseEntity<TransplantationDTO> create(
            @PathVariable String patientId, 
            @PathVariable Integer donneurId, 
            @RequestBody TransplantationDTO dto) {
        Transplantation created = tService.create(toEntity(dto), patientId, donneurId);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')") 
    public ResponseEntity<TransplantationDTO> update(@PathVariable Integer id, @RequestBody TransplantationDTO detailsDto) {
        Transplantation updated = tService.update(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT', 'WRITE_DONNEUR')") 
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tService.delete(id);
        return ResponseEntity.noContent().build();
    }
}