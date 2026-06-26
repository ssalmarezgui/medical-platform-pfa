package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.AntecedentMedical;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.AntecedentMedicalRepository;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class AntecedentMedicalService {

    @Autowired
    private AntecedentMedicalRepository amRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

    public List<AntecedentMedical> getByPatient(String patientId) {
        return amRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<AntecedentMedical> getByDonneur(Integer donorId) {
        return amRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<AntecedentMedical> getAll() {
        return amRepository.findAll();
    }

    public Optional<AntecedentMedical> getById(Integer id) {
        return amRepository.findById(id);
    }

    @Transactional("transactionManager")
    public AntecedentMedical create(AntecedentMedical am, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        am.setPatient(patient);
        return amRepository.save(am);
    }


    @Transactional("transactionManager")
    public AntecedentMedical createForDonor(AntecedentMedical am, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        am.setDonneur(donneur);
        am.setPatient(null);
        return amRepository.save(am);
    }

    @Transactional("transactionManager")
    public AntecedentMedical update(Integer id, AntecedentMedical details) {
        AntecedentMedical am = amRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));

        if (details.getType() != null) am.setType(details.getType());
        if (details.getSousType() != null) am.setSousType(details.getSousType());
        if (details.getDateDebut() != null) am.setDateDebut(details.getDateDebut());
        if (details.getComplication() != null) am.setComplication(details.getComplication());
        if (details.getTraitement() != null) am.setTraitement(details.getTraitement());
        if (details.getEvolution() != null) am.setEvolution(details.getEvolution());
        if (details.getTypeLocalisation() != null) am.setTypeLocalisation(details.getTypeLocalisation());
        if (details.getCauseSiege() != null) am.setCauseSiege(details.getCauseSiege());
        if (details.getLieuPriseEnCharge() != null) am.setLieuPriseEnCharge(details.getLieuPriseEnCharge());

        return amRepository.save(am);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        AntecedentMedical am = amRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));
        amRepository.delete(am);
    }
}