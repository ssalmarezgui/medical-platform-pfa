package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.PatientDTO;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.services.PatientService;
import com.pfa.medical_backend.entities.HopitalStructureSoin;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@Slf4j
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired private PatientService patientService;
    @Autowired private UserRepository userRepository;

    private String getHopitalId(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        
        return userRepository.findByLoginU(auth.getName())
                .filter(u -> u.getService() != null && u.getService().getHopital() != null)
                .map(u -> u.getService().getHopital().getIdentifiantH())
                .orElse(null);
    }

    private boolean isSuiviOnly(Authentication auth) {
        if (auth == null) return false;
        
        return auth.getAuthorities().stream().anyMatch(a -> 
            a.getAuthority().equals("ROLE_MEDECIN_SUIVI") || 
            a.getAuthority().equals("MEDECIN_SUIVI")
        )
                && auth.getAuthorities().stream().noneMatch(a -> 
                    a.getAuthority().equals("ROLE_ADMIN") || 
                    a.getAuthority().equals("ADMIN")
                );
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients(
        @RequestParam(name = "hopitalId", required = false) String hopitalId,
        Authentication auth
    ) {
        Integer medecinInvestigateurId = null;
        Integer medecinSuiviId = null;

        if (auth != null) {
            Optional<com.pfa.medical_backend.entities.User> loggedInUser = userRepository.findByLoginU(auth.getName());
            if (loggedInUser.isPresent()) {
                com.pfa.medical_backend.entities.User user = loggedInUser.get();
                
                if (user.getRole() != null && "ROLE_MEDECIN_SUIVI".equals(user.getRole().getNomRole()) && user.getMedecin() != null) {
                    medecinSuiviId = user.getMedecin().getIdentifiantM();
                    
                    if ((hopitalId == null || hopitalId.trim().isEmpty()) && user.getService() != null && user.getService().getHopital() != null) {
                        hopitalId = user.getService().getHopital().getIdentifiantH();
                    }
                }

                if (user.getRole() != null && "ROLE_MEDECIN_INVESTIGATEUR".equals(user.getRole().getNomRole()) && user.getMedecin() != null) {
                    medecinInvestigateurId = user.getMedecin().getIdentifiantM();
                }
            }
        }

        // Appel de la méthode de service mise à jour avec les 3 paramètres de filtrage
        List<PatientDTO> patients = patientService.getPatientsAsDTO(hopitalId, medecinInvestigateurId, medecinSuiviId);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR','MEDECIN_SUIVI')")
    public ResponseEntity<PatientIdAdmin> getById(@PathVariable String id, Authentication auth) {
        Optional<PatientIdAdmin> patient = patientService.getPatientById(id);
        
        if (patient.isPresent() && isSuiviOnly(auth)) {
            String userHopitalId = getHopitalId(auth);
            if (!patient.get().getIndexHopitalP().equals(userHopitalId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return patient.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN','ROLE_MEDECIN_INVESTIGATEUR','ROLE_MEDECIN_SUIVI')")
    public ResponseEntity<PatientIdAdmin> create(
        @RequestBody PatientIdAdmin patient, 
        Authentication auth) {
        log.info("Création d'un nouveau dossier patient");

        if (auth != null) {
            userRepository.findByLoginU(auth.getName()).ifPresent(user -> {
                String hopitalMedecin = null;
                if (user.getService() != null && user.getService().getHopital() != null) {
                    hopitalMedecin = user.getService().getHopital().getIdentifiantH();
                }

                if (hopitalMedecin != null) {
                    patient.setIndexHopitalP(hopitalMedecin);
                } else {
                    throw new IllegalArgumentException("Le médecin connecté n'est rattaché à aucun hôpital.");
                }

                if (user.getRole() != null ){
                    String nomRole = user.getRole().getNomRole();
                    if ("ROLE_MEDECIN_INVESTIGATEUR".equals(nomRole) && user.getMedecin() != null) {
                        patient.setMedecinInvestigateur(user.getMedecin());
                    }
                    
                    if ("ROLE_MEDECIN_SUIVI".equals(nomRole) && user.getMedecin() != null) {
                        if (patient.getMedecinsSuivi() == null) {
                            patient.setMedecinsSuivi(new java.util.HashSet<>());
                        }
                        patient.getMedecinsSuivi().add(user.getMedecin());
                    }

                }

                
            });
        }

        return new ResponseEntity<>(patientService.createPatient(patient), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR','MEDECIN_SUIVI')")
    public PatientIdAdmin update(@PathVariable String id, @RequestBody PatientIdAdmin details) {
        return patientService.updatePatient(id, details);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{patientId}/services/{serviceId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR')")
    public PatientIdAdmin affecterAuService(@PathVariable String patientId, @PathVariable Integer serviceId) {
        return patientService.affecterPatientAuService(patientId, serviceId);
    }

    @DeleteMapping("/{patientId}/services/{serviceId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN','MEDECIN_INVESTIGATEUR')")
    public ResponseEntity<PatientIdAdmin> desaffecterPatientDuService(
            @PathVariable String patientId, @PathVariable Integer serviceId) {
        try {
            return ResponseEntity.ok(patientService.desaffecterPatientDuService(patientId, serviceId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{patientId}/medecins/{medecinId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR','MEDECIN_SUIVI')")
    public PatientIdAdmin assignerMedecin(@PathVariable String patientId, @PathVariable Integer medecinId) {
        return patientService.assignerMedecinAuPatient(patientId, medecinId);
    }

    @DeleteMapping("/{patientId}/medecins/{medecinId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','MEDECIN_INVESTIGATEUR','MEDECIN_SUIVI')")
    public ResponseEntity<PatientIdAdmin> retirerMedecinDuPatient(
            @PathVariable String patientId, @PathVariable Integer medecinId) {
        try {
            return ResponseEntity.ok(patientService.retirerMedecinDuPatient(patientId, medecinId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpectedException(Exception e) {
        log.error("Une erreur interne est survenue lors du traitement de la requête :", e);
        
        return ResponseEntity.badRequest().body(Map.of("message",
                e.getMessage() != null ? e.getMessage() : "Erreur inattendue"));
    }
}