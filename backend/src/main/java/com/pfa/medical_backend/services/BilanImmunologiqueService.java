package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class BilanImmunologiqueService {

    private final BilanImmunologiqueRepository biRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public BilanImmunologiqueService(
        BilanImmunologiqueRepository biRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.biRepository = biRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public Optional<BilanImmunologique> getByPatient(String patientId) {
        return biRepository.findByPatient_IdentifiantP(patientId);
    }

    public Optional<BilanImmunologique> getByDonneur(Integer donorId) {
        return biRepository.findByDonneur_IdentifiantD(donorId);
    }

    @Transactional("transactionManager")
    public BilanImmunologique createOrUpdateForDonor(Integer donorId, BilanImmunologique incoming) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        Optional<BilanImmunologique> existing = biRepository.findByDonneur_IdentifiantD(donorId);
        BilanImmunologique bi;

        if (existing.isPresent()) {
            bi = existing.get();
            bi.setTypageHLA(incoming.getTypageHLA());
            bi.setBilanImmuno(incoming.getBilanImmuno());
        } else {
            bi = new BilanImmunologique();
            bi.setDonneur(donneur);
            bi.setPatient(null);
            bi.setTypageHLA(incoming.getTypageHLA());
            bi.setBilanImmuno(incoming.getBilanImmuno());
        }

        if (incoming.getAnalyses() != null) {
            bi.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBilanImmunologique(bi);
                ana.setTypeAnalyse("IMMUNOLOGIE");
                bi.getAnalyses().add(ana);
            }
        }

        return biRepository.save(bi);
    }

    @Transactional("transactionManager")
    public BilanImmunologique createOrUpdate(String patientId, BilanImmunologique incoming) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        Optional<BilanImmunologique> existing = biRepository.findByPatient_IdentifiantP(patientId);
        BilanImmunologique bi;

        if (existing.isPresent()) {
            bi = existing.get();
            bi.setTypageHLA(incoming.getTypageHLA());
            bi.setBilanImmuno(incoming.getBilanImmuno());
        } else {
            bi = new BilanImmunologique();
            bi.setPatient(patient);
            bi.setTypageHLA(incoming.getTypageHLA());
            bi.setBilanImmuno(incoming.getBilanImmuno());
        }

        if (incoming.getAnalyses() != null) {
            bi.getAnalyses().clear();
            for (Analyse ana : incoming.getAnalyses()) {
                ana.setBilanImmunologique(bi);
                ana.setTypeAnalyse("IMMUNOLOGIE");
                bi.getAnalyses().add(ana);
            }
        }

        return biRepository.save(bi);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        BilanImmunologique bi = biRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        biRepository.delete(bi);
    }
}