package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.TransplantationAnterieure;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.TransplantationAnterieureRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TransplantationAnterieureService {

    @Autowired
    private TransplantationAnterieureRepository taRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    public List<TransplantationAnterieure> getByPatient(String patientId) {
        return taRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<TransplantationAnterieure> getAll() {
        return taRepository.findAll();
    }

    public Optional<TransplantationAnterieure> getById(Integer id) {
        return taRepository.findById(id);
    }

    @Transactional("transactionManager")
    public TransplantationAnterieure create(TransplantationAnterieure ta, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        ta.setPatient(patient);
        return taRepository.save(ta);
    }

    @Transactional("transactionManager")
    public TransplantationAnterieure update(Integer id, TransplantationAnterieure details) {
        TransplantationAnterieure ta = taRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transplantation non trouvée"));

        if (details.getDateTR() != null) ta.setDateTR(details.getDateTR());
        if (details.getLieuTR() != null) ta.setLieuTR(details.getLieuTR());
        if (details.getLieuSuiviTR() != null) ta.setLieuSuiviTR(details.getLieuSuiviTR());
        if (details.getTypeDonneur() != null) ta.setTypeDonneur(details.getTypeDonneur());
        if (details.getHlaDonneur() != null) ta.setHlaDonneur(details.getHlaDonneur());
        if (details.getTraitementImmunoSuppresseurInduction() != null) ta.setTraitementImmunoSuppresseurInduction(details.getTraitementImmunoSuppresseurInduction());
        if (details.getTraitementImmunoSuppresseurEntretien() != null) ta.setTraitementImmunoSuppresseurEntretien(details.getTraitementImmunoSuppresseurEntretien());
        if (details.getCausePerteGreffonRenale() != null) ta.setCausePerteGreffonRenale(details.getCausePerteGreffonRenale());
        if (details.getDateRetourDialyse() != null) ta.setDateRetourDialyse(details.getDateRetourDialyse());
        if (details.getTransplantectomie() != null) ta.setTransplantectomie(details.getTransplantectomie());
        if (details.getTransplantectomieIndication() != null) ta.setTransplantectomieIndication(details.getTransplantectomieIndication());

        return taRepository.save(ta);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        TransplantationAnterieure ta = taRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transplantation non trouvée"));
        taRepository.delete(ta);
    }
}