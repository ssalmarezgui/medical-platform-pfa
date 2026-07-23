package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AiRequestDTO;
import com.pfa.medical_backend.dto.AiResponseDTO;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import com.pfa.medical_backend.repositories.TransplantationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AiClinicalServiceImpl implements AiClinicalService {

    private static final String NOT_SPECIFIED_F = "Non renseignée";
    private static final String NOT_SPECIFIED_M = "Non renseigné";
    private static final String FASTAPI_BASE_URL = "http://localhost:8000/api/ai";

    private final PatientIdAdminRepository patientRepository;
    private final TransplantationRepository transplantationRepository;
    private final AuditLogService auditLogService;
    
    private final RestTemplate restTemplate = new RestTemplate();

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
        appendBaseContext(sb, p);

        List<Transplantation> transplantations = transplantationRepository.findByPatient_IdentifiantP(p.getIdentifiantP());
        appendTransplantationContext(sb, transplantations);
        
        return sb.toString();
    }

    private void appendBaseContext(StringBuilder sb, PatientIdAdmin p) {
        sb.append("Date de naissance : ").append(p.getDateNaissP() != null ? p.getDateNaissP() : NOT_SPECIFIED_F).append("\n");
        sb.append("Sexe de l'usager : ").append(p.getSexeP() != null ? p.getSexeP() : NOT_SPECIFIED_M).append("\n");
        sb.append("Nationalité : ").append(p.getNationaliteP() != null ? p.getNationaliteP() : NOT_SPECIFIED_F).append("\n");
        sb.append("Adresse du domicile : ").append(p.getAdresseP() != null ? p.getAdresseP() : NOT_SPECIFIED_F).append("\n");
        sb.append("Type de carnet : ").append(p.getTypeCarnetP() != null ? p.getTypeCarnetP() : NOT_SPECIFIED_M).append("\n");
        sb.append("Statut d'admission actuel : ").append(p.getStatut() != null ? p.getStatut() : NOT_SPECIFIED_M).append("\n");
    }


    private void appendTransplantationContext(StringBuilder sb, List<Transplantation> transplantations) {
        if (transplantations != null && !transplantations.isEmpty()) {
            sb.append("\n--- CHIRURGIE ET TRANSPLANTATION ---\n");
            for (int i = 0; i < transplantations.size(); i++) {
                // Appel d'une sous-méthode pour formater chaque greffe et abaisser la complexité cognitive
                appendSingleTransplantationDetails(sb, transplantations.get(i), i + 1);
            }
        } else {
            sb.append("\n--- CHIRURGIE ET TRANSPLANTATION ---\nAucune chirurgie de greffe enregistrée à ce jour.\n");
        }
    }

    private void appendSingleTransplantationDetails(StringBuilder sb, Transplantation t, int index) {
        sb.append("Greffe n°").append(index).append(" :\n");
        sb.append("- Date de la greffe : ").append(t.getDateTR() != null ? t.getDateTR() : NOT_SPECIFIED_F).append("\n");
        sb.append("- Lieu de la greffe : ").append(t.getLieuDeLaGreffe() != null ? t.getLieuDeLaGreffe() : NOT_SPECIFIED_M).append("\n");
        sb.append("- Lieu de suivi post-greffe : ").append(t.getLieuDeSuivi() != null ? t.getLieuDeSuivi() : NOT_SPECIFIED_M).append("\n");
        sb.append("- Rein greffé : ").append(t.getRein() != null ? t.getRein() : "Non spécifié").append("\n");
        sb.append("- Sonde Double JJ présente : ").append(t.getSondeEnDoubleJJ() != null && t.getSondeEnDoubleJJ() ? "Oui" : "Non").append("\n");
        sb.append("- Nombre d'artères/veines reliées : ").append(t.getNbArtereVeine() != null ? t.getNbArtereVeine() : NOT_SPECIFIED_M).append("\n");
        sb.append("- Durée d'ischémie froide : ").append(t.getDureeIschemieFroide() != null ? t.getDureeIschemieFroide() + " minutes" : NOT_SPECIFIED_F).append("\n");
    }
}