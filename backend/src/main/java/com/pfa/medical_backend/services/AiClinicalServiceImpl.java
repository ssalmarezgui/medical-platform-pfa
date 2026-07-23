package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AiRequestDTO;
import com.pfa.medical_backend.dto.AiResponseDTO;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import com.pfa.medical_backend.repositories.TransplantationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AiClinicalServiceImpl implements AiClinicalService {

    private final PatientIdAdminRepository patientRepository;
    private final TransplantationRepository transplantationRepository;
    private final AuditLogService auditLogService;
    
    private static final String FASTAPI_BASE_URL = "http://localhost:8000/api/ai";
    private final RestTemplate restTemplate = new RestTemplate();

    public AiClinicalServiceImpl(PatientIdAdminRepository patientRepository,
                                 TransplantationRepository transplantationRepository,
                                 AuditLogService auditLogService) {
        this.patientRepository = patientRepository;
        this.transplantationRepository = transplantationRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public AiResponseDTO getPatientSummary(String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable."));

        String context = buildPatientContext(patient);

        AiRequestDTO requestPayload = new AiRequestDTO(context);
        AiResponseDTO response = restTemplate.postForObject(
                FASTAPI_BASE_URL + "/summarize", 
                requestPayload, 
                AiResponseDTO.class
        );

        auditLogService.logAuto(
                "GENERATION_SYNTHESE_IA", 
                "Patient: " + patient.getIdentifiantP(),
                "Génération automatique d'un résumé clinique par l'IA locale."
        );

        return response;
    }

    @Override
    public AiResponseDTO getPatientReport(String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable."));

        String context = buildPatientContext(patient);

        AiRequestDTO requestPayload = new AiRequestDTO(context);
        AiResponseDTO response = restTemplate.postForObject(
                FASTAPI_BASE_URL + "/report", 
                requestPayload, 
                AiResponseDTO.class
        );

        auditLogService.logAuto(
                "GENERATION_RAPPORT_IA", 
                "Patient: " + patient.getIdentifiantP(),
                "Rédaction automatique d'un rapport médical de synthèse officiel par l'IA locale."
        );

        return response;
    }

    private String buildPatientContext(PatientIdAdmin p) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("=== DOSSIER CLINIQUE BRUT ===\n");
        sb.append("Identifiant Unique de l'usager : ").append(p.getIdentifiantP()).append("\n");
        sb.append("Date de naissance : ").append(p.getDateNaissP() != null ? p.getDateNaissP() : "Non renseignée").append("\n");
        sb.append("Sexe de l'usager : ").append(p.getSexeP() != null ? p.getSexeP() : "Non renseigné").append("\n");
        sb.append("Nationalité : ").append(p.getNationaliteP() != null ? p.getNationaliteP() : "Non renseignée").append("\n");
        sb.append("Adresse du domicile : ").append(p.getAdresseP() != null ? p.getAdresseP() : "Non renseignée").append("\n");
        sb.append("Type de carnet : ").append(p.getTypeCarnetP() != null ? p.getTypeCarnetP() : "Non renseigné").append("\n");
        sb.append("Statut d'admission actuel : ").append(p.getStatut() != null ? p.getStatut() : "Non renseigné").append("\n");

        List<Transplantation> transplantations = transplantationRepository.findByPatient_IdentifiantP(p.getIdentifiantP());
        
        if (transplantations != null && !transplantations.isEmpty()) {
            sb.append("\n--- CHIRURGIE ET TRANSPLANTATION ---\n");
            for (int i = 0; i < transplantations.size(); i++) {
                Transplantation t = transplantations.get(i);
                sb.append("Greffe n°").append(i+1).append(" :\n");
                sb.append("- Date de la greffe : ").append(t.getDateTR() != null ? t.getDateTR() : "Non renseignée").append("\n");
                sb.append("- Lieu de la greffe : ").append(t.getLieuDeLaGreffe() != null ? t.getLieuDeLaGreffe() : "Non renseigné").append("\n");
                sb.append("- Lieu de suivi post-greffe : ").append(t.getLieuDeSuivi() != null ? t.getLieuDeSuivi() : "Non renseigné").append("\n");
                sb.append("- Rein greffé : ").append(t.getRein() != null ? t.getRein() : "Non spécifié").append("\n");
                sb.append("- Sonde Double JJ présente : ").append(t.getSondeEnDoubleJJ() != null && t.getSondeEnDoubleJJ() ? "Oui" : "Non").append("\n");
                sb.append("- Nombre d'artères/veines reliées : ").append(t.getNbArtereVeine() != null ? t.getNbArtereVeine() : "Non renseigné").append("\n");
                sb.append("- Durée d'ischémie froide : ").append(t.getDureeIschemieFroide() != null ? t.getDureeIschemieFroide() + " minutes" : "Non renseignée").append("\n");
            }
        } else {
            sb.append("\n--- CHIRURGIE ET TRANSPLANTATION ---\nAucune chirurgie de greffe enregistrée à ce jour.\n");
        }

        return sb.toString();
    }
}