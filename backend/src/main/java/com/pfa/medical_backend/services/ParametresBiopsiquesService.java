package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ParametresBiopsiquesService {

    private final ParametresBiopsiquesRepository pbRepository;
    private final NephropathieInitialeRepository niRepository;


    public Optional<ParametresBiopsiques> getByNephropathie(Integer nephropathieId) {
        return pbRepository.findByNephropathie_IdentifiantNI(nephropathieId);
    }

    public Optional<ParametresBiopsiques> getById(Integer id) {
        return pbRepository.findById(id);
    }

    @Transactional("transactionManager")
    public ParametresBiopsiques create(ParametresBiopsiques pb, Integer nephropathieId) {
        Optional<ParametresBiopsiques> existing = pbRepository.findByNephropathie_IdentifiantNI(nephropathieId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Erreur : Un rapport de biopsie existe déjà pour cette pathologie.");
        }

        NephropathieInitiale ni = niRepository.findById(nephropathieId)
            .orElseThrow(() -> new EntityNotFoundException("Néphropathie non trouvée"));
        
        pb.setNephropathie(ni);
        return pbRepository.save(pb);
    }

    @Transactional("transactionManager")
    public ParametresBiopsiques update(Integer id, ParametresBiopsiques details) {
        ParametresBiopsiques pb = pbRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Dossier biopsique non trouvé"));

        return pbRepository.save(pb);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        ParametresBiopsiques pb = pbRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Dossier biopsique non trouvé"));
        pbRepository.delete(pb);
    }
}