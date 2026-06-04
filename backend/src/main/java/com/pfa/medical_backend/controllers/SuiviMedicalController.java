package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.services.SuiviMedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suivi")
@CrossOrigin(origins = "*")
public class SuiviMedicalController {

    @Autowired
    private SuiviMedicalService suiviService;

    // MÉDECINS

    @GetMapping("/prescriptions/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_SUIVI')")
    public List<Prescription> getPrescriptions(@PathVariable String patientId) {
        return suiviService.getPrescriptionsParPatient(patientId);
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_SUIVI')")
    public ResponseEntity<Prescription> prescrire(@RequestBody Prescription p, @RequestParam Integer tisId) {
        return new ResponseEntity<>(suiviService.ajouterPrescription(p, tisId), HttpStatus.CREATED);
    }

    // AGENTS LABO

    @GetMapping("/dosages/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','AGENT_LABORATOIRE')")
    public List<DosageMedSang> getDosages(@PathVariable String patientId) {
        return suiviService.getHistoriqueDosages(patientId);
    }

    @PostMapping("/dosages")
    @PreAuthorize("hasAnyAuthority('ADMIN','AGENT_LABORATOIRE')")
    public ResponseEntity<DosageMedSang> enregistrerDosage(@RequestBody DosageMedSang d, @RequestParam Integer tisId) {
        return new ResponseEntity<>(suiviService.enregistrerAnalyseSang(d, tisId), HttpStatus.CREATED);
    }

    // BILANS

    @GetMapping("/bilans/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_INVESTIGATEUR')")
    public List<BilanGreffe> getBilans(@PathVariable String patientId) {
        return suiviService.getBilansParPatient(patientId);
    }
}