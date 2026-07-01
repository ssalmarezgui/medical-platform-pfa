package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.pfa.medical_backend.dto.PatientDTO;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@Transactional("transactionManager") // Applique la transaction à l'échelle de la classe
public class PatientService {

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    public PatientIdAdmin affecterPatientAuService(String patientId, Integer serviceId) {
        Optional<PatientIdAdmin> patient = patientRepository.findById(patientId);
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);

        if (patient.isPresent() && service.isPresent()) {
            PatientIdAdmin p = patient.get();
            ServiceMedical s = service.get();
            validateServiceBelongsToPatientHopital(p, s);

            boolean exists = p.getAffectations().stream()
                .anyMatch(a -> a.getService().getIdentifiantS().equals(serviceId));
            if (!exists) {
                p.getAffectations().add(new AffectationPatientService(p, s));
                return patientRepository.save(p);
            }
            return p;
        }
        throw new RuntimeException("Patient ou service non trouve");
    }

    public PatientIdAdmin desaffecterPatientDuService(String patientId, Integer serviceId) {
        Optional<PatientIdAdmin> patient = patientRepository.findById(patientId);
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId); // <-- RESTAURÉ D'ORIGINE

        if (patient.isPresent() && service.isPresent()) {
            PatientIdAdmin p = patient.get();
            p.getAffectations().removeIf(a -> a.getService().getIdentifiantS().equals(serviceId));
            return patientRepository.save(p);
        }
        throw new RuntimeException("Patient ou service non trouve");
    }

    public PatientIdAdmin assignerMedecinAuPatient(String patientId, Long medecinId) {
        Optional<PatientIdAdmin> patient = patientRepository.findById(patientId);
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);

        if (patient.isPresent() && medecin.isPresent()) {
            PatientIdAdmin p = patient.get();
            Medecin m = medecin.get();
            validateSuiviMedecin(m);
            p.getMedecinsSuivi().add(m);
            return patientRepository.save(p);
        }
        throw new RuntimeException("Patient ou medecin non trouve");
    }

    public PatientIdAdmin retirerMedecinDuPatient(String patientId, Long medecinId) {
        Optional<PatientIdAdmin> patient = patientRepository.findById(patientId);
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);

        if (patient.isPresent() && medecin.isPresent()) {
            PatientIdAdmin p = patient.get();
            Medecin m = medecin.get();
            p.getMedecinsSuivi().remove(m);
            return patientRepository.save(p);
        }
        throw new RuntimeException("Patient ou medecin non trouve");
    }

    public List<PatientIdAdmin> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<PatientIdAdmin> getPatientsByService(Integer serviceId) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        return service.map(patientRepository::findByService).orElse(List.of());
    }

    public List<PatientIdAdmin> getPatientsByMedecin(Long medecinId) {
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);
        return medecin.map(patientRepository::findByMedecinSuiveur).orElse(List.of());
    }

    public List<PatientIdAdmin> getPatientsByHopital(String userHopitalId) {
        return patientRepository.findByHopitalId(userHopitalId);
    }

    public Optional<PatientIdAdmin> getPatientById(String patientId) {
        return patientRepository.findById(patientId);
    }

    // --- ENREGISTREMENT ET ENQUÊTE D'IDENTITÉ UNIQUES AVEC TYPES STRICTS ---
    @Transactional("transactionManager")
    public PatientIdAdmin createPatient(PatientIdAdmin incoming) {
        if (incoming == null) {
            throw new IllegalArgumentException("Les données du patient sont manquantes.");
        }

        System.out.println("=== ENQUÊTE D'IDENTITO-VIGILANCE EN BASE ===");
        
        boolean isAdulte = incoming.getAdulteP() != null ? incoming.getAdulteP() : true;
        
        // Conversion de Integer vers String pour le CIN et le Carnet
        String checkCin = incoming.getNumeroCin() != null ? String.valueOf(incoming.getNumeroCin()).trim() : "";
        String checkCarnet = incoming.getNumCarnetP() != null ? String.valueOf(incoming.getNumCarnetP()).trim() : "";
        
        LocalDate checkDate = incoming.getDateNaissP();
        
        String checkNom = incoming.getNomP() != null ? incoming.getNomP().trim().toLowerCase() : "";
        String checkPrenom = incoming.getPrenomP() != null ? incoming.getPrenomP().trim().toLowerCase() : "";

        if (checkCin.isEmpty()) {
            throw new IllegalArgumentException("Le numéro CIN ou CIN du parent est requis.");
        }

        // --- ÉTAPE 1 : RECHERCHE STRICTE DE DOUBLONS EN BASE (SANS BLOQUER LE CARNET FAMILIAL) ---
        Optional<PatientIdAdmin> doublon = Optional.empty();

        if (isAdulte) {
            // Scénario Adulte : Même CIN ET même Date de Naissance
            doublon = patientRepository.findAll().stream()
                .filter(p -> (p.getAdulteP() != null && p.getAdulteP()) 
                    && (p.getNumeroCin() != null && String.valueOf(p.getNumeroCin()).trim().equalsIgnoreCase(checkCin) && p.getDateNaissP().equals(checkDate)))
                .findFirst();
        } else {
            // Scénario Enfant : Même CIN Parent (numeroCin) AND même Date de Naissance AND même Nom AND même Prénom
            doublon = patientRepository.findAll().stream()
                .filter(p -> (p.getAdulteP() != null && !p.getAdulteP())
                    && p.getNumeroCin() != null && String.valueOf(p.getNumeroCin()).trim().equalsIgnoreCase(checkCin)
                    && p.getDateNaissP() != null && p.getDateNaissP().equals(checkDate)
                    && p.getNomP() != null && p.getNomP().trim().toLowerCase().equals(checkNom)
                    && p.getPrenomP() != null && p.getPrenomP().trim().toLowerCase().equals(checkPrenom))
                .findFirst();
        }

        if (doublon.isPresent()) {
            throw new IllegalArgumentException("DOUBLON_DETECTED:" + doublon.get().getIdentifiantP());
        }

        // --- ÉTAPE 2 : CALCUL CONFORME DE L'IDENTIFIANT CLINIQUE (AVEC SUFFIXES) ---
        PatientIdAdmin patient = copyBaseFields(incoming, new PatientIdAdmin());
        
        if (patient.getIndexHopitalP() == null || patient.getIndexHopitalP().trim().isEmpty()) {
            throw new IllegalArgumentException("L'index de l'hôpital est requis.");
        }

        // Code hôpital tronqué à 3 lettres
        String codeHopital = patient.getIndexHopitalP().trim().substring(0, 3).toUpperCase();
        String partCIN = checkCin.length() >= 4 ? checkCin.substring(checkCin.length() - 4) : "0000";
        String partCarnet = checkCarnet.length() >= 4 ? checkCarnet.substring(checkCarnet.length() - 4) : "0000";
        String suffixe = isAdulte ? "A" : "E"; 

        int sequence = patientRepository.findByIndexHopitalP(patient.getIndexHopitalP()).size() + 1;
        String sequenceStr = String.format("%03d", sequence);

        // Assemblage final de l'identifiant clinique unique (ex: "FAT_4563_7894_E_002")
        String customId = codeHopital + "_" + partCIN + "_" + partCarnet + "_" + suffixe + "_" + sequenceStr;
        patient.setIdentifiantP(customId);

        System.out.println("Identifiant unique généré avec succès en base : " + patient.getIdentifiantP());

        if (incoming.getMedecinInvestigateur() != null) {
            attachInvestigateur(patient, incoming.getMedecinInvestigateur());
        }

        PatientIdAdmin saved = patientRepository.save(patient);

        if (incoming.getAffectations() != null && !incoming.getAffectations().isEmpty()) {
            resolveAffectations(saved, incoming);
        }
        
        resolveSuiviMedecins(saved, incoming);

        return patientRepository.save(saved);
    }

    @Transactional("transactionManager")
    public PatientIdAdmin updatePatient(String patientId, PatientIdAdmin patientDetails) {
        Optional<PatientIdAdmin> patient = patientRepository.findById(patientId);
        if (patient.isEmpty()) {
            throw new RuntimeException("Patient non trouve");
        }

        PatientIdAdmin existing = patient.get();
        boolean hopitalUpdated = updateBaseFields(existing, patientDetails);

        if (patientDetails.getMedecinInvestigateur() != null) {
            attachInvestigateur(existing, patientDetails.getMedecinInvestigateur());
        }

        if (patientDetails.getAffectations() != null) {
            existing.getAffectations().clear();
            resolveAffectations(existing, patientDetails);
        } else if (hopitalUpdated) {
            for (AffectationPatientService affectation : existing.getAffectations()) {
                validateServiceBelongsToPatientHopital(existing, affectation.getService());
            }
        }

        if (patientDetails.getMedecinsSuivi() != null) {
            existing.getMedecinsSuivi().clear();
            resolveSuiviMedecins(existing, patientDetails);
        }

        return patientRepository.save(existing);
    }

    @Transactional("transactionManager")
    public void deletePatient(String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouve"));

        for (Medecin medecin : new HashSet<>(patient.getMedecinsSuivi())) {
            medecin.getPatientsSuivis().remove(patient);
        }
        patient.getMedecinsSuivi().clear();
        patient.getAffectations().clear();
        patient.setMedecinInvestigateur(null);
        patientRepository.delete(patient);
    }

    private PatientIdAdmin copyBaseFields(PatientIdAdmin source, PatientIdAdmin target) {
        target.setNomP(source.getNomP());
        target.setPrenomP(source.getPrenomP());
        target.setNationaliteP(source.getNationaliteP());
        target.setSexeP(source.getSexeP());
        target.setOrigineGeogP(source.getOrigineGeogP());
        target.setAdresseP(source.getAdresseP());
        target.setTelephoneP(source.getTelephoneP());
        target.setAdressEmailP(source.getAdressEmailP());
        target.setTelephoneWhatsAppP(source.getTelephoneWhatsAppP());
        target.setDateNaissP(source.getDateNaissP());
        target.setPersonneAcontacterP(source.getPersonneAcontacterP());
        target.setTypeCarnetP(source.getTypeCarnetP());
        target.setNumCarnetP(source.getNumCarnetP());
        target.setIndexHopitalP(source.getIndexHopitalP());
        target.setAdulteP(source.getAdulteP());
        target.setStatut(source.getStatut());
        target.setEvolution(source.getEvolution());
        target.setNiveauEducation(source.getNiveauEducation());
        target.setEnEtatActivite(source.getEnEtatActivite());
        target.setNumeroCin(source.getNumeroCin());
        return target;
    }

    private boolean updateBaseFields(PatientIdAdmin target, PatientIdAdmin source) {
        boolean hopitalUpdated = false;

        if (source.getNomP() != null) target.setNomP(source.getNomP());
        if (source.getPrenomP() != null) target.setPrenomP(source.getPrenomP());
        if (source.getNationaliteP() != null) target.setNationaliteP(source.getNationaliteP());
        if (source.getSexeP() != null) target.setSexeP(source.getSexeP());
        if (source.getOrigineGeogP() != null) target.setOrigineGeogP(source.getOrigineGeogP());
        if (source.getAdresseP() != null) target.setAdresseP(source.getAdresseP());
        if (source.getTelephoneP() != null) target.setTelephoneP(source.getTelephoneP());
        if (source.getAdressEmailP() != null) target.setAdressEmailP(source.getAdressEmailP());
        if (source.getTelephoneWhatsAppP() != null) target.setTelephoneWhatsAppP(source.getTelephoneWhatsAppP());
        if (source.getDateNaissP() != null) target.setDateNaissP(source.getDateNaissP());
        if (source.getPersonneAcontacterP() != null) target.setPersonneAcontacterP(source.getPersonneAcontacterP());
        if (source.getTypeCarnetP() != null) target.setTypeCarnetP(source.getTypeCarnetP());
        if (source.getNumCarnetP() != null) target.setNumCarnetP(source.getNumCarnetP());
        if (source.getIndexHopitalP() != null) {
            target.setIndexHopitalP(source.getIndexHopitalP());
            hopitalUpdated = true;
        }
        if (source.getAdulteP() != null) target.setAdulteP(source.getAdulteP());
        if (source.getStatut() != null) target.setStatut(source.getStatut());
        if (source.getEvolution() != null) target.setEvolution(source.getEvolution());
        if (source.getNiveauEducation() != null) target.setNiveauEducation(source.getNiveauEducation());
        if (source.getEnEtatActivite() != null) target.setEnEtatActivite(source.getEnEtatActivite());
        if (source.getNumeroCin() != null) target.setNumeroCin(source.getNumeroCin());

        return hopitalUpdated;
    }

    private void resolveAffectations(PatientIdAdmin patient, PatientIdAdmin incoming) {
        if (incoming.getAffectations() == null) {
            return;
        }

        for (AffectationPatientService aff : incoming.getAffectations()) {
            if (aff.getService() == null || aff.getService().getIdentifiantS() == null) {
                continue;
            }

            ServiceMedical service = serviceRepository.findById(aff.getService().getIdentifiantS())
                .orElseThrow(() -> new IllegalArgumentException("Service patient introuvable."));
            validateServiceBelongsToPatientHopital(patient, service);

            AffectationPatientService newAff = new AffectationPatientService(patient, service);
            if (aff.getDateAffectation() != null) {
                newAff.setDateAffectation(aff.getDateAffectation());
            }
            patient.getAffectations().add(newAff);
        }
    }

    private void resolveSuiviMedecins(PatientIdAdmin patient, PatientIdAdmin incoming) {
        if (incoming.getMedecinsSuivi() == null) {
            return;
        }

        for (Medecin input : incoming.getMedecinsSuivi()) {
            if (input.getIdentifiantM() == null) {
                continue;
            }

            Medecin medecin = medecinRepository.findById(input.getIdentifiantM())
                .orElseThrow(() -> new IllegalArgumentException("Medecin de suivi introuvable."));
            validateSuiviMedecin(medecin);
            patient.getMedecinsSuivi().add(medecin);
        }
    }

    private void attachInvestigateur(PatientIdAdmin patient, Medecin input) {
        if (input == null || input.getIdentifiantM() == null) {
            patient.setMedecinInvestigateur(null);
            return;
        }

        Medecin investigateur = medecinRepository.findById(input.getIdentifiantM())
            .orElseThrow(() -> new IllegalArgumentException("Medecin investigateur introuvable."));
        validateInvestigateur(investigateur);
        patient.setMedecinInvestigateur(investigateur);
    }

    private void validateServiceBelongsToPatientHopital(PatientIdAdmin patient, ServiceMedical service) {
        String patientHopitalId = parseHopitalId(patient.getIndexHopitalP());
        String serviceHopitalId = resolveServiceHopitalId(service);

        if (patientHopitalId == null || serviceHopitalId == null) {
            return;
        }

        if (!patientHopitalId.equals(serviceHopitalId)) {
            throw new IllegalArgumentException("Le patient ne peut choisir qu'un service lie a son hopital.");
        }
    }

    private void validateInvestigateur(Medecin medecin) {
        if (medecin.getTypeMedecin() == null) {
            return;
        }
        if (medecin.getTypeMedecin() != TypeMedecin.INVESTIGATEUR) {
            throw new IllegalArgumentException("Le medecin investigateur doit etre de type INVESTIGATEUR.");
        }
    }

    private void validateSuiviMedecin(Medecin medecin) {
        if (medecin.getTypeMedecin() == null) {
            return;
        }
        if (medecin.getTypeMedecin() != TypeMedecin.SUIVI) {
            throw new IllegalArgumentException("Le medecin de suivi doit etre de type SUIVI.");
        }
    }

    private String parseHopitalId(String hopitalId) {
        if (hopitalId == null || hopitalId.isBlank()) {
            return null;
        }
        try {
            return hopitalId.trim();
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String resolveServiceHopitalId(ServiceMedical service) {
        if (service.getHopital() != null && service.getHopital().getIdentifiantH() != null) {
            return service.getHopital().getIdentifiantH();
        }
        return service.getIdHopital();
    }

    public List<PatientDTO> getPatientsAsDTO(String hopitalId, Long medecinInvestigateurId, Long medecinSuiviId) {
        List<PatientIdAdmin> patients;
        
        if (medecinInvestigateurId != null) {
            List<PatientIdAdmin> patientsDeLInvestigateur = medecinRepository.findById(medecinInvestigateurId)
                    .map(patientRepository::findByMedecinInvestigateur)
                    .orElse(List.of());
            
            if (hopitalId != null && !hopitalId.trim().isEmpty()) {
                patients = patientsDeLInvestigateur.stream()
                        .filter(p -> hopitalId.equals(p.getIndexHopitalP()))
                        .collect(Collectors.toList());
            } else {
                patients = patientsDeLInvestigateur;
            }
            
        } else if (medecinSuiviId != null) {
            List<PatientIdAdmin> patientsDuMedecin = medecinRepository.findById(medecinSuiviId)
                    .map(patientRepository::findByMedecinSuiveur)
                    .orElse(List.of());
            
            if (hopitalId != null && !hopitalId.trim().isEmpty()) {
                patients = patientsDuMedecin.stream()
                        .filter(p -> hopitalId.equals(p.getIndexHopitalP()))
                        .collect(Collectors.toList());
            } else {
                patients = patientsDuMedecin;
            }
        } else if (hopitalId != null && !hopitalId.trim().isEmpty()) {
            patients = patientRepository.findByIndexHopitalP(hopitalId);
        } else {
            patients = patientRepository.findAll();
        }
        
        return patients.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private PatientDTO convertToDTO(PatientIdAdmin p) {
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
        return dto;
    }
}