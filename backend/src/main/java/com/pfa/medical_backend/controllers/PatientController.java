package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.PatientDTO;
import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.services.PatientService;

import lombok.extern.slf4j.Slf4j;

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
public class PatientController {

    private static final String ROLE_MED_SUIVI = "ROLE_MEDECIN_SUIVI";

    private final PatientService patientService;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, UserRepository userRepository) {
        this.patientService = patientService;
        this.userRepository = userRepository;
    }

    private PatientDTO toDTO(PatientIdAdmin p) {
        PatientDTO dto = new PatientDTO();
        dto.setIdentifiantP(p.getIdentifiantP());
        dto.setNomP(p.getNomP());
        dto.setPrenomP(p.getPrenomP());
        dto.setIndexHopitalP(p.getIndexHopitalP());
        dto.setNumeroCin(p.getNumeroCin());
        dto.setDateNaissP(p.getDateNaissP());
        dto.setSexeP(p.getSexeP());
        dto.setNationaliteP(p.getNationaliteP());
        dto.setOrigineGeogP(p.getOrigineGeogP());
        dto.setAdresseP(p.getAdresseP());
        dto.setTelephoneP(p.getTelephoneP());
        dto.setAdressEmailP(p.getAdressEmailP());
        dto.setTelephoneWhatsAppP(p.getTelephoneWhatsAppP());
        dto.setPersonneAcontacterP(p.getPersonneAcontacterP());
        dto.setTypeCarnetP(p.getTypeCarnetP());
        dto.setNumCarnetP(p.getNumCarnetP());
        dto.setAdulteP(p.getAdulteP());
        dto.setStatut(p.getStatut());
        dto.setEvolution(p.getEvolution());
        dto.setNiveauEducation(p.getNiveauEducation());
        dto.setEnEtatActivite(p.getEnEtatActivite());
        
        if (p.getMedecinInvestigateur() != null) {
            dto.setMedecinInvestigateurId(p.getMedecinInvestigateur().getIdentifiantM());
            dto.setMedecinInvestigateurNom(p.getMedecinInvestigateur().getPrenomM() + " " + p.getMedecinInvestigateur().getNomM());
        }

        if (p.getMedecinsSuivi() != null && !p.getMedecinsSuivi().isEmpty()) {
            Long suiviId = p.getMedecinsSuivi().iterator().next().getIdentifiantM();
            dto.setMedecinSuiviId(suiviId);
        }

        return dto;
    }

    private PatientIdAdmin toEntity(PatientDTO dto) {
        PatientIdAdmin p = new PatientIdAdmin();
        p.setIdentifiantP(dto.getIdentifiantP());
        p.setNomP(dto.getNomP());
        p.setPrenomP(dto.getPrenomP());
        p.setIndexHopitalP(dto.getIndexHopitalP());
        p.setNumeroCin(dto.getNumeroCin());
        p.setDateNaissP(dto.getDateNaissP());
        p.setSexeP(dto.getSexeP());
        p.setNationaliteP(dto.getNationaliteP());
        p.setOrigineGeogP(dto.getOrigineGeogP());
        p.setAdresseP(dto.getAdresseP());
        p.setTelephoneP(dto.getTelephoneP());
        p.setAdressEmailP(dto.getAdressEmailP());
        p.setTelephoneWhatsAppP(dto.getTelephoneWhatsAppP());
        p.setPersonneAcontacterP(dto.getPersonneAcontacterP());
        p.setTypeCarnetP(dto.getTypeCarnetP());
        p.setNumCarnetP(dto.getNumCarnetP());
        p.setAdulteP(dto.getAdulteP());
        p.setStatut(dto.getStatut());
        p.setEvolution(dto.getEvolution());
        p.setNiveauEducation(dto.getNiveauEducation());
        p.setEnEtatActivite(dto.getEnEtatActivite());
        
        if (dto.getMedecinInvestigateurId() != null) {
            Medecin inv = new Medecin();
            inv.setIdentifiantM(dto.getMedecinInvestigateurId());
            p.setMedecinInvestigateur(inv);
        }

        if (dto.getMedecinSuiviId() != null) {
            Medecin suivi = new Medecin();
            suivi.setIdentifiantM(dto.getMedecinSuiviId());
            p.setMedecinsSuivi(new java.util.HashSet<>(java.util.List.of(suivi)));
        }

        return p;
    }

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
            a.getAuthority().equals(ROLE_MED_SUIVI) || 
            a.getAuthority().equals("MEDECIN_SUIVI")                    
        )
        && auth.getAuthorities().stream().noneMatch(a -> 
            a.getAuthority().equals("ROLE_ADMIN") || 
            a.getAuthority().equals("ADMIN")
        );
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_PATIENT')")
    public ResponseEntity<List<PatientDTO>> getAllPatients(
        @RequestParam(name = "hopitalId", required = false) String hopitalId,
        Authentication auth
    ) {
        SearchContext context = resolveSearchContext(hopitalId, auth);
        
        List<PatientDTO> patients = patientService.getPatientsAsDTO(
            context.resolvedHopitalId, 
            context.medecinInvestigateurId, 
            context.medecinSuiviId
        );
        return ResponseEntity.ok(patients);
    }

    private SearchContext resolveSearchContext(String hopitalId, Authentication auth) {
        if (auth == null) {
            return new SearchContext(hopitalId, null, null);
        }

        return userRepository.findByLoginU(auth.getName()).map(user -> {
            Long medecinInvestigateurId = null;
            Long medecinSuiviId = null;
            String resolvedHopitalId = hopitalId;

            if (user.getRole() != null && user.getMedecin() != null) {
                String roleName = user.getRole().getNomRole();
                if (ROLE_MED_SUIVI.equals(roleName)) {
                    medecinSuiviId = user.getMedecin().getIdentifiantM();
                    if ((resolvedHopitalId == null || resolvedHopitalId.trim().isEmpty()) 
                        && user.getService() != null && user.getService().getHopital() != null) {
                        resolvedHopitalId = user.getService().getHopital().getIdentifiantH();
                    }
                } else if ("ROLE_MEDECIN_INVESTIGATEUR".equals(roleName)) {
                    medecinInvestigateurId = user.getMedecin().getIdentifiantM();
                }
            }
            return new SearchContext(resolvedHopitalId, medecinInvestigateurId, medecinSuiviId);
        }).orElse(new SearchContext(hopitalId, null, null));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('READ_PATIENT')")
    public ResponseEntity<PatientDTO> getById(@PathVariable String id, Authentication auth) {
        Optional<PatientIdAdmin> patient = patientService.getPatientById(id);
        
        if (patient.isPresent() && isSuiviOnly(auth)) {
            String userHopitalId = getHopitalId(auth);
            if (!patient.get().getIndexHopitalP().equals(userHopitalId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return patient.map(this::toDTO).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> create(@RequestBody PatientDTO dto, Authentication auth) {
        log.info("Création d'un nouveau dossier patient");
        PatientIdAdmin patient = toEntity(dto);

        enrichPatientWithAuthContext(patient, auth);

        PatientIdAdmin created = patientService.createPatient(patient);
        return new ResponseEntity<>(toDTO(created), HttpStatus.CREATED);
    }

    private void enrichPatientWithAuthContext(PatientIdAdmin patient, Authentication auth) {
        if (auth == null) {
            return;
        }

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

            if (user.getRole() != null && user.getMedecin() != null) {
                associateMedecinRole(patient, user);
            }
        });
    }

    private void associateMedecinRole(PatientIdAdmin patient, User user) {
        String nomRole = user.getRole().getNomRole();
        if ("ROLE_MEDECIN_INVESTIGATEUR".equals(nomRole)) {
            patient.setMedecinInvestigateur(user.getMedecin());
        } else if (ROLE_MED_SUIVI.equals(nomRole)) {
            if (patient.getMedecinsSuivi() == null) {
                patient.setMedecinsSuivi(new java.util.HashSet<>());
            }
            patient.getMedecinsSuivi().add(user.getMedecin());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> update(@PathVariable String id, @RequestBody PatientDTO detailsDto) {
        PatientIdAdmin updated = patientService.updatePatient(id, toEntity(detailsDto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PATIENT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{patientId}/services/{serviceId}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> affecterAuService(@PathVariable String patientId, @PathVariable Integer serviceId) {
        PatientIdAdmin updated = patientService.affecterPatientAuService(patientId, serviceId);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{patientId}/services/{serviceId}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> desaffecterPatientDuService(
            @PathVariable String patientId, @PathVariable Integer serviceId) {
        try {
            PatientIdAdmin updated = patientService.desaffecterPatientDuService(patientId, serviceId);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{patientId}/medecins/{medecinId}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> assignerMedecin(@PathVariable String patientId, @PathVariable Long medecinId) {
        PatientIdAdmin updated = patientService.assignerMedecinAuPatient(patientId, medecinId);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{patientId}/medecins/{medecinId}")
    @PreAuthorize("hasAnyAuthority('WRITE_PATIENT')")
    public ResponseEntity<PatientDTO> retirerMedecinDuPatient(
            @PathVariable String patientId, @PathVariable Long medecinId) {
        try {
            PatientIdAdmin updated = patientService.retirerMedecinDuPatient(patientId, medecinId);
            return ResponseEntity.ok(toDTO(updated));
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

    private static class SearchContext {
        final String resolvedHopitalId;
        final Long medecinInvestigateurId;
        final Long medecinSuiviId;

        SearchContext(String resolvedHopitalId, Long medecinInvestigateurId, Long medecinSuiviId) {
            this.resolvedHopitalId = resolvedHopitalId;
            this.medecinInvestigateurId = medecinInvestigateurId;
            this.medecinSuiviId = medecinSuiviId;
        }
    }
}