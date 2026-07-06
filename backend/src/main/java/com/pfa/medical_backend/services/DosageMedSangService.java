package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DosageMedSangService {

    private final DosageMedSangRepository dmsRepository;
    private final TraitementImmunoSuppresseurRepository tisRepository;
    
    public DosageMedSangService(
        DosageMedSangRepository dmsRepository,
        TraitementImmunoSuppresseurRepository tisRepository
    ) {
        this.dmsRepository = dmsRepository;
        this.tisRepository = tisRepository;
    }

    public List<DosageMedSang> getByTraitement(Integer traitementId) {
        return dmsRepository.findByTraitement_IdentifiantTIS(traitementId);
    }

    public List<DosageMedSang> getAll() {
        return dmsRepository.findAll();
    }

    public Optional<DosageMedSang> getById(Integer id) {
        return dmsRepository.findById(id);
    }

    @Transactional("transactionManager")
    public DosageMedSang create(DosageMedSang dms, Integer traitementId) {
        TraitementImmunoSuppresseur tis = tisRepository.findById(traitementId)
            .orElseThrow(() -> new RuntimeException("Dossier d'immuno-suppression non trouvé"));
        dms.setTraitement(tis);
        return dmsRepository.save(dms);
    }

    @Transactional("transactionManager")
    public DosageMedSang update(Integer id, DosageMedSang details) {
        DosageMedSang dms = dmsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dosage sanguin non trouvé"));

        if (details.getDateDMS() != null) dms.setDateDMS(details.getDateDMS());
        if (details.getLabelDMS() != null) dms.setLabelDMS(details.getLabelDMS());
        if (details.getValeurDMS() != null) dms.setValeurDMS(details.getValeurDMS());
        if (details.getObservationDMS() != null) dms.setObservationDMS(details.getObservationDMS());

        return dmsRepository.save(dms);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        DosageMedSang dms = dmsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dosage sanguin non trouvé"));
        dmsRepository.delete(dms);
    }
}