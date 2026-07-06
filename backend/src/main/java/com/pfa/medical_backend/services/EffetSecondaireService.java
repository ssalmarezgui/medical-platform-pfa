package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class EffetSecondaireService {

    private final EffetSecondaireRepository esRepository;
    private final PrescriptionRepository prescriptionRepository;

    public EffetSecondaireService(
        EffetSecondaireRepository esRepository,
        PrescriptionRepository prescriptionRepository
    ) {
        this.esRepository = esRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public List<EffetSecondaire> getByPrescription(Integer prescriptionId) {
        return esRepository.findByPrescription_IdentifiantPrescription(prescriptionId);
    }

    public List<EffetSecondaire> getAll() {
        return esRepository.findAll();
    }

    public Optional<EffetSecondaire> getById(Integer id) {
        return esRepository.findById(id);
    }

    @Transactional("transactionManager")
    public EffetSecondaire create(EffetSecondaire es, Integer prescriptionId) {
        Prescription p = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new RuntimeException("Prescription non trouvée"));
        es.setPrescription(p);
        return esRepository.save(es);
    }

    @Transactional("transactionManager")
    public EffetSecondaire update(Integer id, EffetSecondaire details) {
        EffetSecondaire es = esRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Effet secondaire non trouvé"));

        if (details.getLibelleEFS() != null) es.setLibelleEFS(details.getLibelleEFS());
        if (details.getDescriptionEFS() != null) es.setDescriptionEFS(details.getDescriptionEFS());
        if (details.getRecommendationEFS() != null) es.setRecommendationEFS(details.getRecommendationEFS());

        return esRepository.save(es);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        EffetSecondaire es = esRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Effet secondaire non trouvé"));
        esRepository.delete(es);
    }
}