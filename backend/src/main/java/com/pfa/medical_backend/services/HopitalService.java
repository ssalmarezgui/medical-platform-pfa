package com.pfa.medical_backend.services;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pfa.medical_backend.repositories.*;

import jakarta.persistence.EntityManager;

import com.pfa.medical_backend.entities.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class HopitalService {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private HopitalStructureSoinRepository hopitalRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;


    public List<HopitalStructureSoin> getAllHopitaux() {
        entityManager.clear();
        
        List<HopitalStructureSoin> hopitaux = hopitalRepository.findAll();
        
        for (HopitalStructureSoin h : hopitaux) {
            if (h.getServices() != null) {
                h.setNbServiceH(h.getServices().size());
            } else {
                h.setNbServiceH(0);
            }
        }
        return hopitaux;
    }

    public Optional<HopitalStructureSoin> getHopitalById(String id) {
        Optional<HopitalStructureSoin> h = hopitalRepository.findById(id);
        
        h.ifPresent(hospital -> {
            if (hospital.getServices() != null) {
                hospital.setNbServiceH(hospital.getServices().size());
            } else {
                hospital.setNbServiceH(0);
            }
        });
        
        return h;
    }

    @Transactional("transactionManager")
    public HopitalStructureSoin createHopital(HopitalStructureSoin hopital) {
        if (hopital.getIdentifiantH() == null || hopital.getIdentifiantH().length() != 10) {
            throw new IllegalArgumentException("Erreur : Le code hôpital doit comporter exactement 10 caractères alphanumériques.");
        }
        
        if (hopitalRepository.existsById(hopital.getIdentifiantH())) {
            throw new RuntimeException("Erreur : Un hôpital avec ce code unique existe déjà.");
        }
        
        return hopitalRepository.save(hopital);
    }

    @Transactional("transactionManager")
    public HopitalStructureSoin updateHopital(String hopitalId, HopitalStructureSoin details) {
        HopitalStructureSoin h = hopitalRepository.findById(hopitalId)
            .orElseThrow(() -> new RuntimeException("Hôpital non trouvé"));

        if (details.getLibelleH() != null) h.setLibelleH(details.getLibelleH());
        if (details.getAdresseH() != null) h.setAdresseH(details.getAdresseH());
        if (details.getNbBlocH() != null) h.setNbBlocH(details.getNbBlocH());
        if (details.getNbServiceH() != null) h.setNbServiceH(details.getNbServiceH());
        if (details.getNbLitsH() != null) h.setNbLitsH(details.getNbLitsH());
        if (details.getDescriptionH() != null) h.setDescriptionH(details.getDescriptionH());
        if (details.getDateCreationH() != null) h.setDateCreationH(details.getDateCreationH());
        
        return hopitalRepository.save(h);
    }

    @Transactional("transactionManager")
    public void deleteHopital(String hopitalId) {
        HopitalStructureSoin hopital = hopitalRepository.findById(hopitalId)
            .orElseThrow(() -> new RuntimeException("Hôpital non trouvé"));

        List<ServiceMedical> services = serviceRepository.findByHopital_IdentifiantH(hopitalId);

        for (ServiceMedical service : new HashSet<>(services)) {
            for (User user : new HashSet<>(service.getUsers())) {
                user.setService(null);
                userRepository.save(user);
            }
            for (Medecin medecin : new HashSet<>(service.getMedecins())) {
                medecin.setService(null);
                medecinRepository.save(medecin);
            }
            serviceRepository.delete(service);
        }
        hopitalRepository.delete(hopital);
    }


    public List<ServiceMedical> getServicesOfHopital(String hopitalId) {
        if (!hopitalRepository.existsById(hopitalId)) {
            throw new RuntimeException("Hôpital non trouvé");
        }
        return serviceRepository.findByHopital_IdentifiantH(hopitalId);
    }

    @Transactional("transactionManager")
    public HopitalStructureSoin ajouterServiceAHopital(String hopitalId, ServiceMedical service) {
        HopitalStructureSoin h = hopitalRepository.findById(hopitalId)
            .orElseThrow(() -> new RuntimeException("Hôpital non trouvé"));
        
        service.setHopital(h);
        serviceRepository.save(service);
        
        h.getServices().add(service);
        return hopitalRepository.save(h);
    }

    public List<ServiceMedical> getServicesOfHopital1(String hopitalId) {
        return serviceRepository.findByHopital_IdentifiantH(hopitalId);
    }


    @Transactional("transactionManager")
    public HopitalStructureSoin retirerServiceDeHopital(String hopitalId, Integer serviceId) {
        Optional<HopitalStructureSoin> hopital = hopitalRepository.findById(hopitalId);
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);

        if (hopital.isPresent() && service.isPresent()) {
            HopitalStructureSoin h = hopital.get();
            ServiceMedical s = service.get();
            h.getServices().remove(s);
            return hopitalRepository.save(h);
        }
        throw new RuntimeException("Hôpital ou Service non trouvé");
    }
}

