package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.AntecedentChirurgical;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.AntecedentChirurgicalRepository;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class AntecedentChirurgicalService {

    @Autowired
    private AntecedentChirurgicalRepository acRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

    public List<AntecedentChirurgical> getByPatient(String patientId) {
        return acRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<AntecedentChirurgical> getByDonneur(Integer donorId) {
        return acRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<AntecedentChirurgical> getAll() {
        return acRepository.findAll();
    }

    public Optional<AntecedentChirurgical> getById(Integer id) {
        return acRepository.findById(id);
    }

    @Transactional("transactionManager")
    public AntecedentChirurgical create(AntecedentChirurgical ac, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        ac.setPatient(patient);
        return acRepository.save(ac);
    }

    @Transactional("transactionManager")
    public AntecedentChirurgical createForDonor(AntecedentChirurgical ac, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        ac.setDonneur(donneur);
        ac.setPatient(null);
        return acRepository.save(ac);
    }

    @Transactional("transactionManager")
    public AntecedentChirurgical update(Integer id, AntecedentChirurgical details) {
        AntecedentChirurgical ac = acRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));

        if (details.getIntervention() != null) ac.setIntervention(details.getIntervention());
        if (details.getDate() != null) ac.setDate(details.getDate());
        if (details.getLieu() != null) ac.setLieu(details.getLieu());
        if (details.getChirurgien() != null) ac.setChirurgien(details.getChirurgien());
        if (details.getEvolution() != null) ac.setEvolution(details.getEvolution());

        return acRepository.save(ac);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        AntecedentChirurgical ac = acRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));
        acRepository.delete(ac);
    }
}