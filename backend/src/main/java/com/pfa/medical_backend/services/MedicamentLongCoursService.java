package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.MedicamentLongCours;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.MedicamentLongCoursRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class MedicamentLongCoursService {

    @Autowired
    private MedicamentLongCoursRepository mlcRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

    public List<MedicamentLongCours> getByPatient(String patientId) {
        return mlcRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<MedicamentLongCours> getByDonneur(Integer donorId) {
        return mlcRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<MedicamentLongCours> getAll() {
        return mlcRepository.findAll();
    }

    public Optional<MedicamentLongCours> getById(Integer id) {
        return mlcRepository.findById(id);
    }

    @Transactional("transactionManager")
    public MedicamentLongCours create(MedicamentLongCours mlc, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        mlc.setPatient(patient);
        return mlcRepository.save(mlc);
    }

    @Transactional("transactionManager")
    public MedicamentLongCours createForDonor(MedicamentLongCours mlc, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        mlc.setDonneur(donneur);
        mlc.setPatient(null);
        return mlcRepository.save(mlc);
    }

    @Transactional("transactionManager")
    public MedicamentLongCours update(Integer id, MedicamentLongCours details) {
        MedicamentLongCours mlc = mlcRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));

        if (details.getLibelleMLC() != null) mlc.setLibelleMLC(details.getLibelleMLC());
        if (details.getMolecule() != null) mlc.setMolecule(details.getMolecule());
        if (details.getIndication() != null) mlc.setIndication(details.getIndication());
        if (details.getDebutTraitement() != null) mlc.setDebutTraitement(details.getDebutTraitement());

        return mlcRepository.save(mlc);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        MedicamentLongCours mlc = mlcRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));
        mlcRepository.delete(mlc);
    }
}