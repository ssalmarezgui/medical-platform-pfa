package com.pfa.medical_backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pfa.medical_backend.entities.Medicament;
import com.pfa.medical_backend.repositories.MedicamentRepository;

@Service
public class MedicamentService {
    @Autowired private MedicamentRepository medicamentRepo;

    public List<Medicament> getAll() { return medicamentRepo.findAll(); }
    
    public List<Medicament> getInteractions(Integer id) {
        return medicamentRepo.findInteractions(id);
    }

    @Transactional("transactionManager")
    public void ajouterInteraction(Integer id1, Integer id2) {
        Medicament m1 = medicamentRepo.findById(id1).orElseThrow();
        Medicament m2 = medicamentRepo.findById(id2).orElseThrow();
        m1.getInteractions().add(m2);
        medicamentRepo.save(m1);
    }
}
