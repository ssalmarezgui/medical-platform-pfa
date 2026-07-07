package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.Habitude;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.HabitudeRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class HabitudeService {

    private final HabitudeRepository habitudeRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public HabitudeService(
        HabitudeRepository habitudeRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.habitudeRepository = habitudeRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public List<Habitude> getByPatient(String patientId) {
        return habitudeRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<Habitude> getByDonneur(Integer donorId) {
        return habitudeRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<Habitude> getAll() {
        return habitudeRepository.findAll();
    }

    public Optional<Habitude> getById(Integer id) {
        return habitudeRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Habitude create(Habitude habitude, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        habitude.setPatient(patient);
        return habitudeRepository.save(habitude);
    }

    @Transactional("transactionManager")
    public Habitude createForDonor(Habitude habitude, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        habitude.setDonneur(donneur);
        habitude.setPatient(null);
        return habitudeRepository.save(habitude);
    }

    @Transactional("transactionManager")
    public Habitude update(Integer id, Habitude details) {
        Habitude h = habitudeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Habitude non trouvée"));

        if (details.getLibelleHA() != null) h.setLibelleHA(details.getLibelleHA());
        if (details.getTypeSubstance() != null) h.setTypeSubstance(details.getTypeSubstance());
        if (details.getDetails() != null) h.setDetails(details.getDetails());
        if (details.getQuantiteConsomme() != null) h.setQuantiteConsomme(details.getQuantiteConsomme());
        if (details.getPeriodeExposition() != null) h.setPeriodeExposition(details.getPeriodeExposition());
        if (details.getSevrage() != null) h.setSevrage(details.getSevrage());

        return habitudeRepository.save(h);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Habitude h = habitudeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Habitude non trouvée"));
        habitudeRepository.delete(h);
    }
}