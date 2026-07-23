package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AiResponseDTO;
import com.pfa.medical_backend.services.AiClinicalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
public class AiClinicalController {

    private final AiClinicalService aiClinicalService;

    public AiClinicalController(AiClinicalService aiClinicalService) {
        this.aiClinicalService = aiClinicalService;
    }

    @GetMapping("/{uuid}/ai-summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDECIN_SUIVI', 'ROLE_MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<AiResponseDTO> getPatientSummary(@PathVariable String uuid) {
        AiResponseDTO response = aiClinicalService.getPatientSummary(uuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{uuid}/ai-report")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDECIN_SUIVI', 'ROLE_MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<AiResponseDTO> getPatientReport(@PathVariable String uuid) {
        AiResponseDTO response = aiClinicalService.getPatientReport(uuid);
        return ResponseEntity.ok(response);
    }
}