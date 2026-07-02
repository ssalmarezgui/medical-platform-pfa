package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;


import com.pfa.medical_backend.security.SecurityConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class MedecinService {

    private final SecurityConfig securityConfig;

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired
    private UserRepository userRepository;



    MedecinService(SecurityConfig securityConfig) {
        this.securityConfig = securityConfig;
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
                .orElseThrow(() -> new RuntimeException("Service non trouvÃ©"));
            validateServiceBelongsToMedecinHopital(medecin, service);
            medecin.setService(service);
        }
        return medecinRepository.save(medecin);
    }

    @Transactional("transactionManager")
    public Medecin updateMedecin(Long medecinId, Medecin medecinDetails) {
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);
        if (medecin.isPresent()) {
            Medecin m = medecin.get();
            boolean hopitalUpdated = false;
            
            if (medecinDetails.getNomM() != null) m.setNomM(medecinDetails.getNomM());
            if (medecinDetails.getPrenomM() != null) m.setPrenomM(medecinDetails.getPrenomM());
            if (medecinDetails.getDateNaissM() != null) m.setDateNaissM(medecinDetails.getDateNaissM());
            if (medecinDetails.getSexeM() != null) m.setSexeM(medecinDetails.getSexeM());
            if (medecinDetails.getNumTelM() != null) m.setNumTelM(medecinDetails.getNumTelM());
            if (medecinDetails.getNumTelWhapAPPM() != null) m.setNumTelWhapAPPM(medecinDetails.getNumTelWhapAPPM());
            if (medecinDetails.getAdresseDomM() != null) m.setAdresseDomM(medecinDetails.getAdresseDomM());
            if (medecinDetails.getSpecialiteM() != null) m.setSpecialiteM(medecinDetails.getSpecialiteM());
            if (medecinDetails.getDateDernierDiplomeM() != null) m.setDateDernierDiplomeM(medecinDetails.getDateDernierDiplomeM());
            if (medecinDetails.getTypeMedecin() != null) m.setTypeMedecin(medecinDetails.getTypeMedecin());
            if (medecinDetails.getIndexHopitalM() != null) {
                m.setIndexHopitalM(medecinDetails.getIndexHopitalM());
                hopitalUpdated = true;
            }

            if (medecinDetails.getService() != null) {
                serviceRepository.findById(medecinDetails.getService().getIdentifiantS())
                    .ifPresent(service -> {
                        validateServiceBelongsToMedecinHopital(m, service);
                        m.setService(service);
                    });
            } else if (hopitalUpdated && m.getService() != null) {
                validateServiceBelongsToMedecinHopital(m, m.getService());
            }

            return medecinRepository.save(m);
        }
        throw new RuntimeException("Médecin non trouvé");
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

        // Comparaison
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

