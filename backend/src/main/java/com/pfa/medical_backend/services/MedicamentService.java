package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Medicament;
import com.pfa.medical_backend.repositories.MedicamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class MedicamentService {

    @Autowired
    private MedicamentRepository medicamentRepository;

    

    public List<Medicament> getAll() {
        return medicamentRepository.findAll();
    }

    public List<Medicament> getByType(String type) {
        return medicamentRepository.findByTypeMedContainingIgnoreCase(type);
    }

    public Optional<Medicament> getById(Integer id) {
        return medicamentRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Medicament create(Medicament m) {
        return medicamentRepository.save(m);
    }

    @Transactional("transactionManager")
    public Medicament update(Integer id, Medicament details) {
        Medicament m = medicamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));

        if (details.getNomCommercialMed() != null) m.setNomCommercialMed(details.getNomCommercialMed());
        if (details.getDescriptionMed() != null) m.setDescriptionMed(details.getDescriptionMed());
        if (details.getTypeMed() != null) m.setTypeMed(details.getTypeMed());
        if (details.getPosologieMed() != null) m.setPosologieMed(details.getPosologieMed());

        return medicamentRepository.save(m);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Medicament m = medicamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));
        medicamentRepository.delete(m);
    }
}