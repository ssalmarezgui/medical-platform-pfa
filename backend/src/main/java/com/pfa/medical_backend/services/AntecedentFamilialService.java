package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.AntecedentFamilial;
import com.pfa.medical_backend.entities.Donneur;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.AntecedentFamilialRepository;
import com.pfa.medical_backend.repositories.DonneurRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class AntecedentFamilialService {

    private final AntecedentFamilialRepository afRepository;
    private final PatientIdAdminRepository patientRepository;
    private final DonneurRepository donneurRepository;

    public AntecedentFamilialService(
        AntecedentFamilialRepository afRepository,
        PatientIdAdminRepository patientRepository,
        DonneurRepository donneurRepository
    ) {
        this.afRepository = afRepository;
        this.patientRepository = patientRepository;
        this.donneurRepository = donneurRepository;
    }

    public List<AntecedentFamilial> getByPatient(String patientId) {
        return afRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<AntecedentFamilial> getByDonneur(Integer donorId) {
        return afRepository.findByDonneur_IdentifiantD(donorId);
    }

    public List<AntecedentFamilial> getAll() {
        return afRepository.findAll();
    }

    public Optional<AntecedentFamilial> getById(Integer id) {
        return afRepository.findById(id);
    }

    @Transactional("transactionManager")
    public AntecedentFamilial create(AntecedentFamilial af, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        af.setPatient(patient);
        return afRepository.save(af);
    }

    @Transactional("transactionManager")
    public AntecedentFamilial createForDonor(AntecedentFamilial af, Integer donorId) {
        Donneur donneur = donneurRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));
        af.setDonneur(donneur);
        af.setPatient(null);
        return afRepository.save(af);
    }

    @Transactional("transactionManager")
    public AntecedentFamilial update(Integer id, AntecedentFamilial details) {
        AntecedentFamilial af = afRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));

        if (details.getTypeRelation() != null) af.setTypeRelation(details.getTypeRelation());
        if (details.getDateDeNaissance() != null) af.setDateDeNaissance(details.getDateDeNaissance());
        if (details.getProfession() != null) af.setProfession(details.getProfession());
        if (details.getTares() != null) af.setTares(details.getTares());
        if (details.getConsanguinite() != null) af.setConsanguinite(details.getConsanguinite());

        return afRepository.save(af);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        AntecedentFamilial af = afRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Antécédent non trouvé"));
        afRepository.delete(af);
    }
}