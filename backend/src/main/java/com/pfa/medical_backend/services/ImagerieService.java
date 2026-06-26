package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.Imagerie;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.ImagerieRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ImagerieService {

    @Autowired
    private ImagerieRepository imagerieRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired 
    private DonneurRepository donneurRepository;

    public List<Imagerie> getByPatient(String patientId) {
        return imagerieRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<Imagerie> getByDonneur(Integer donorId) {
        return imagerieRepository.findByDonneur_IdentifiantD(donorId);
    }



    public List<Imagerie> getAll() {
        return imagerieRepository.findAll();
    }

    public Optional<Imagerie> getById(Integer id) {
        return imagerieRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Imagerie create(Imagerie imagerie, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        imagerie.setPatient(patient);
        return imagerieRepository.save(imagerie);
    }

    @Transactional("transactionManager")
    public Imagerie createForDonor(Imagerie imagerie, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        imagerie.setDonneur(donneur);
        imagerie.setPatient(null);
        return imagerieRepository.save(imagerie);
    }

    @Transactional("transactionManager")
    public Imagerie update(Integer id, Imagerie details) {
        Imagerie im = imagerieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Examen d'imagerie non trouvé"));

        if (details.getExamenIm() != null) im.setExamenIm(details.getExamenIm());
        if (details.getDateIm() != null) im.setDateIm(details.getDateIm());
        if (details.getResultatIm() != null) im.setResultatIm(details.getResultatIm());

        return imagerieRepository.save(im);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Imagerie im = imagerieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Examen d'imagerie non trouvé"));
        imagerieRepository.delete(im);
    }
}