package com.pfa.medical_backend.services;


import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;

import jakarta.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceHospitalierService {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private HopitalStructureSoinRepository hopitalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;


    @Transactional("transactionManager")
    public ServiceMedical assignerUtilisateurAuService(Integer serviceId, Integer userId) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        Optional<User> user = userRepository.findById(userId);

        if (service.isPresent() && user.isPresent()) {
            ServiceMedical s = service.get();
            User u = user.get();
            s.getUsers().add(u);
            return serviceRepository.save(s);
        }
        throw new RuntimeException("Service ou Utilisateur non trouvé");
    }


    @Transactional("transactionManager")
    public ServiceMedical retirerUtilisateurDuService(Integer serviceId, Integer userId) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        Optional<User> user = userRepository.findById(userId);

        if (service.isPresent() && user.isPresent()) {
            ServiceMedical s = service.get();
            User u = user.get();
            s.getUsers().remove(u);
            return serviceRepository.save(s);
        }
        throw new RuntimeException("Service ou Utilisateur non trouvé");
    }


    public List<ServiceMedical> getAllServices() {
        entityManager.clear();
        
        List<ServiceMedical> services = serviceRepository.findAll();
        for (ServiceMedical s : services) {
            if (s.getMedecins() != null) {
                s.setNbMedecinsS(s.getMedecins().size());
            } else {
                s.setNbMedecinsS(0);
            }
        }
        return services;
    }


    public List<ServiceMedical> getServicesParHopital(String hopitalId) {
        entityManager.clear();
        
        if (!hopitalRepository.existsById(hopitalId)) {
            throw new RuntimeException("Hôpital non trouvé avec le code : " + hopitalId);
        }
        
        List<ServiceMedical> services = serviceRepository.findByHopital_IdentifiantH(hopitalId);
        for (ServiceMedical s : services) {
            if (s.getMedecins() != null) {
                s.setNbMedecinsS(s.getMedecins().size());
            } else {
                s.setNbMedecinsS(0);
            }
        }
        return services;
    }
    
    public List<ServiceMedical> getServicesByHopital(String hopitalId) {
        entityManager.clear();
        
        Optional<HopitalStructureSoin> hopital = hopitalRepository.findById(hopitalId);
        if (hopital.isPresent()) {
            List<ServiceMedical> services = serviceRepository.findByHopital_IdentifiantH(hopitalId);
            for (ServiceMedical s : services) {
                if (s.getMedecins() != null) {
                    s.setNbMedecinsS(s.getMedecins().size());
                } else {
                    s.setNbMedecinsS(0);
                }
            }
            return services;
        }
        throw new RuntimeException("Hôpital non trouvé");
    }

    public Optional<ServiceMedical> getServiceById(Integer serviceId) {
        Optional<ServiceMedical> s = serviceRepository.findById(serviceId);
        s.ifPresent(service -> {
            int nombreReel = service.getMedecins().size();
            service.setNbMedecinsS(nombreReel);
        });
        
        return s;
    }

    @Transactional("transactionManager")
    public ServiceMedical createService(ServiceMedical service, String hopitalId) {
        HopitalStructureSoin hopital = hopitalRepository.findById(hopitalId)
            .orElseThrow(() -> new RuntimeException("Hôpital non trouvé"));
        
        service.setHopital(hopital);

        return serviceRepository.save(service);
    }

    @Transactional("transactionManager")
    public ServiceMedical updateService(Integer serviceId, ServiceMedical serviceDetails) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        if (service.isPresent()) {
            ServiceMedical s = service.get();
            if (serviceDetails.getLibelleS() != null) s.setLibelleS(serviceDetails.getLibelleS());
            if (serviceDetails.getNbLitsS() != null) s.setNbLitsS(serviceDetails.getNbLitsS());
            if (serviceDetails.getNbChambresS() != null) s.setNbChambresS(serviceDetails.getNbChambresS());
            if (serviceDetails.getNbMedecinsS() != null) s.setNbMedecinsS(serviceDetails.getNbMedecinsS());
            return serviceRepository.save(s);
        }
        throw new RuntimeException("Service non trouvé");
    }

    @Transactional("transactionManager")
    public void deleteService(Integer serviceId) {
        ServiceMedical service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        for (User user : new HashSet<>(service.getUsers())) {
            user.setService(null);
            userRepository.save(user);
        }
        service.getUsers().clear();

        for (Medecin medecin : new HashSet<>(service.getMedecins())) {
            medecin.setService(null);
            medecinRepository.save(medecin);
        }
        service.getMedecins().clear();

        for (AffectationPatientService affectation : new HashSet<>(service.getAffectationsPatients())) {
            PatientIdAdmin patient = affectation.getPatient();
            if (patient != null) {
                patient.getAffectations().remove(affectation);
                patientRepository.save(patient);
            }
        }
        service.getAffectationsPatients().clear();

        serviceRepository.delete(service);
    }

    public List<User> getUsersByService(Integer serviceId) {
        Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
        if (service.isPresent()) {
            return userRepository.findByService(service.get());
        }
        throw new RuntimeException("Service non trouvé");
    }
}

