package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.MarqueursTumoraux;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.MarqueursTumorauxRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class MarqueursTumorauxService {

    private final MarqueursTumorauxRepository mtRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public MarqueursTumorauxService(
        MarqueursTumorauxRepository mtRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.mtRepository = mtRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public List<MarqueursTumoraux> getByPatient(String patientId) {
        return mtRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<MarqueursTumoraux> getByDonneur(Integer donorId) {
        return mtRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<MarqueursTumoraux> getAll() {
        return mtRepository.findAll();
    }

    public Optional<MarqueursTumoraux> getById(Integer id) {
        return mtRepository.findById(id);
    }

    @Transactional("transactionManager")
    public MarqueursTumoraux create(MarqueursTumoraux mt, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        List<MarqueursTumoraux> existingList = mtRepository.findByPatient_IdentifiantP(patientId);
        MarqueursTumoraux mtToSave;

        if (!existingList.isEmpty()) {
            mtToSave = existingList.get(0);
            mtToSave.setNomM(mt.getNomM());
            mtToSave.setResultat(mt.getResultat());
        } else {
            mtToSave = new MarqueursTumoraux();
            mtToSave.setPatient(patient);
            mtToSave.setNomM(mt.getNomM());
            mtToSave.setResultat(mt.getResultat());
        }

        return mtRepository.save(mtToSave);
    }

    @Transactional("transactionManager")
    public MarqueursTumoraux createForDonor(MarqueursTumoraux mt, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        List<MarqueursTumoraux> existingList = mtRepository.findByDonneur_IdentifiantD(donorId);
        MarqueursTumoraux mtToSave;

        if (!existingList.isEmpty()) {
            mtToSave = existingList.get(0);
            mtToSave.setNomM(mt.getNomM());
            mtToSave.setResultat(mt.getResultat());
        } else {
            mtToSave = new MarqueursTumoraux();
            mtToSave.setDonneur(donneur);
            mtToSave.setPatient(null);
            mtToSave.setNomM(mt.getNomM());
            mtToSave.setResultat(mt.getResultat());
        }

        return mtRepository.save(mtToSave);
    }

    @Transactional("transactionManager")
    public MarqueursTumoraux update(Integer id, MarqueursTumoraux details) {
        MarqueursTumoraux mt = mtRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        if (details.getNomM() != null) mt.setNomM(details.getNomM());
        if (details.getResultat() != null) mt.setResultat(details.getResultat());

        return mtRepository.save(mt);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        MarqueursTumoraux mt = mtRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
        mtRepository.delete(mt);
    }

    public MarqueursTumoraux createOrUpdate(String patientId, MarqueursTumoraux mt) {
        throw new UnsupportedOperationException("Unimplemented method 'createOrUpdate'");
    }
}