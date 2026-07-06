package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import com.pfa.medical_backend.security.SecurityConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class MedecinService {

    private final SecurityConfig securityConfig;
    private final MedecinRepository medecinRepository;
    private final ServiceRepository serviceRepository;
    private final PatientIdAdminRepository patientRepository;
    private final UserRepository userRepository;

    public MedecinService(
        SecurityConfig securityConfig,
        MedecinRepository medecinRepository,
        ServiceRepository serviceRepository,
        PatientIdAdminRepository patientRepository,
        UserRepository userRepository
    ) {
        this.securityConfig = securityConfig;
        this.medecinRepository = medecinRepository;
        this.serviceRepository = serviceRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional("transactionManager")
    public Medecin assignerMedecinAuService(Long medecinId, Integer serviceId) {
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);

        if (medecin.isPresent() && service.isPresent()) {
            Medecin m = medecin.get();
            ServiceMedical s = service.get();
            validateServiceBelongsToMedecinHopital(m, s);
            m.setService(s);
            return medecinRepository.save(m);
        }
        throw new RuntimeException("Médecin ou Service non trouvé");
    }

    @Transactional("transactionManager")
    public Medecin retirerMedecinDuService(Long medecinId, Integer serviceId) {
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);

        if (medecin.isPresent() && service.isPresent()) {
            Medecin m = medecin.get();
            m.setService(null);
            return medecinRepository.save(m);
        }
        throw new RuntimeException("Médecin ou Service non trouvé");
    }

    public List<Medecin> getAllMedecins() {
        return medecinRepository.findAll();
    }

    public List<Medecin> getMedecinsByService(Integer serviceId) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        if (service.isPresent()) {
            return medecinRepository.findByService(service.get());
        }
        return List.of();
    }
  
    public List<Medecin> getMedecinsParService(Integer serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new RuntimeException("Service non trouvé");
        }
        return medecinRepository.findByService_IdentifiantS(serviceId);
    }

    public List<Medecin> getMedecinsByHopital(String hopitalId) {
        return medecinRepository.findByHopitalId(hopitalId);
    }

    public Optional<Medecin> getMedecinById(Long medecinId) {
        return medecinRepository.findById(medecinId);
    }

    @Transactional("transactionManager")
    public Medecin createMedecin(Medecin medecin) {
        if (medecin.getService() != null && medecin.getService().getIdentifiantS() != null) {
            ServiceMedical service = serviceRepository.findById(medecin.getService().getIdentifiantS())
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));
            validateServiceBelongsToMedecinHopital(medecin, service);
            medecin.setService(service);
        }
        return medecinRepository.save(medecin);
    }

    @Transactional("transactionManager")
    public Medecin updateMedecin(Long medecinId, Medecin medecinDetails) {
        Medecin m = medecinRepository.findById(medecinId)
            .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        boolean hopitalUpdated = updateMedecinFields(m, medecinDetails);
        resolveMedecinService(m, medecinDetails, hopitalUpdated);

        return medecinRepository.save(m);
    }

    private boolean updateMedecinFields(Medecin target, Medecin source) {
        boolean hopitalUpdated = false;

        if (source.getNomM() != null) target.setNomM(source.getNomM());
        if (source.getPrenomM() != null) target.setPrenomM(source.getPrenomM());
        if (source.getDateNaissM() != null) target.setDateNaissM(source.getDateNaissM());
        if (source.getSexeM() != null) target.setSexeM(source.getSexeM());
        if (source.getNumTelM() != null) target.setNumTelM(source.getNumTelM());
        if (source.getNumTelWhapAPPM() != null) target.setNumTelWhapAPPM(source.getNumTelWhapAPPM());
        if (source.getAdresseDomM() != null) target.setAdresseDomM(source.getAdresseDomM());
        if (source.getSpecialiteM() != null) target.setSpecialiteM(source.getSpecialiteM());
        if (source.getDateDernierDiplomeM() != null) target.setDateDernierDiplomeM(source.getDateDernierDiplomeM());
        if (source.getTypeMedecin() != null) target.setTypeMedecin(source.getTypeMedecin());
        if (source.getIndexHopitalM() != null) {
            target.setIndexHopitalM(source.getIndexHopitalM());
            hopitalUpdated = true;
        }

        return hopitalUpdated;
    }

    private void resolveMedecinService(Medecin m, Medecin medecinDetails, boolean hopitalUpdated) {
        if (medecinDetails.getService() != null) {
            serviceRepository.findById(medecinDetails.getService().getIdentifiantS())
                .ifPresent(service -> {
                    validateServiceBelongsToMedecinHopital(m, service);
                    m.setService(service);
                });
        } else if (hopitalUpdated && m.getService() != null) {
            validateServiceBelongsToMedecinHopital(m, m.getService());
        }
    }

    @Transactional("transactionManager")
    public void deleteMedecin(Long medecinId) {
        Medecin medecin = medecinRepository.findById(medecinId)
            .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        if (medecin.getUtilisateur() != null) {
            User user = medecin.getUtilisateur();
            user.setMedecin(null);
            medecin.setUtilisateur(null); 
            userRepository.delete(user);
        }

        List<PatientIdAdmin> patientsInvestigues = patientRepository.findByMedecinInvestigateur(medecin);
        for (PatientIdAdmin patient : patientsInvestigues) {
            patient.setMedecinInvestigateur(null);
            patientRepository.save(patient);
        }

        for (PatientIdAdmin patient : new HashSet<>(medecin.getPatientsSuivis())) {
            patient.getMedecinsSuivi().remove(medecin);
            patientRepository.save(patient);
        }
        medecin.getPatientsSuivis().clear();
        medecin.setService(null);

        medecinRepository.delete(medecin);
    }

    private void validateServiceBelongsToMedecinHopital(Medecin medecin, ServiceMedical service) {
        String medecinHopitalId = medecin.getIndexHopitalM();
        String serviceHopitalId = resolveServiceHopitalId(service);

        if (medecinHopitalId == null || serviceHopitalId == null) {
            return;
        }

        if (!medecinHopitalId.trim().equalsIgnoreCase(serviceHopitalId.trim())) {
            throw new IllegalArgumentException("Le médecin ne peut choisir qu'un service lié à son hôpital.");
        }
    }

    private String resolveServiceHopitalId(ServiceMedical service) {
        if (service.getHopital() != null && service.getHopital().getIdentifiantH() != null) {
            return service.getHopital().getIdentifiantH();
        }
        return service.getIdHopital();
    }
}