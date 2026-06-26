package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private TraitementImmunoSuppresseurRepository tisRepository;

    @Autowired
    private MedicamentRepository medicamentRepository;

    public List<Prescription> getByTraitement(Integer traitementId) {
        return prescriptionRepository.findByTraitement_IdentifiantTIS(traitementId);
    }

    public List<Prescription> getAll() {
        return prescriptionRepository.findAll();
    }

    public Optional<Prescription> getById(Integer id) {
        return prescriptionRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Prescription create(Prescription p, Integer traitementId, Integer medicamentId) {
        TraitementImmunoSuppresseur tis = tisRepository.findById(traitementId)
            .orElseThrow(() -> new RuntimeException("Traitement d'immuno-suppression non trouvé"));
            
        Medicament m = medicamentRepository.findById(medicamentId)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));

        p.setTraitement(tis);
        p.setMedicament(m);
        return prescriptionRepository.save(p);
    }

    @Transactional("transactionManager")
    public Prescription update(Integer id, Prescription details) {
        Prescription p = prescriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Prescription non trouvée"));

        if (details.getDatePremierePrise() != null) p.setDatePremierePrise(details.getDatePremierePrise());
        if (details.getDosageMed() != null) p.setDosageMed(details.getDosageMed());
        if (details.getDateSortie() != null) p.setDateSortie(details.getDateSortie());

        return prescriptionRepository.save(p);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Prescription p = prescriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Prescription non trouvée"));
        prescriptionRepository.delete(p);
    }
}