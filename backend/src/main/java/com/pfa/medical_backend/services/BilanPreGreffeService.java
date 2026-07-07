package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class BilanPreGreffeService {

    private final BilanPreGreffeRepository bpgRepository;
    private final NephropathieInitialeRepository niRepository;

    public BilanPreGreffeService(
        BilanPreGreffeRepository bpgRepository,
        NephropathieInitialeRepository niRepository
    ) {
        this.bpgRepository = bpgRepository;
        this.niRepository = niRepository;
    }

    public List<BilanPreGreffe> getByNephropathie(Integer nephropathieId) {
        return bpgRepository.findByNephropathie_IdentifiantNI(nephropathieId);
    }

    public List<BilanPreGreffe> getAll() {
        return bpgRepository.findAll();
    }

    public Optional<BilanPreGreffe> getById(Integer id) {
        return bpgRepository.findById(id);
    }

    @Transactional("transactionManager")
    public BilanPreGreffe create(BilanPreGreffe bpg, Integer nephropathieId) {
        NephropathieInitiale ni = niRepository.findById(nephropathieId)
            .orElseThrow(() -> new RuntimeException("Néphropathie initiale non trouvée"));
        bpg.setNephropathie(ni);
        return bpgRepository.save(bpg);
    }

    @Transactional("transactionManager")
    public BilanPreGreffe update(Integer id, BilanPreGreffe details) {
        BilanPreGreffe bpg = bpgRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bilan pré-greffe non trouvé"));

        if (details.getDateBilanB() != null) bpg.setDateBilanB(details.getDateBilanB());
        if (details.getDescriptionBilanB() != null) bpg.setDescriptionBilanB(details.getDescriptionBilanB());
        if (details.getResultatBilanB() != null) bpg.setResultatBilanB(details.getResultatBilanB());
        if (details.getRapportBilanB() != null) bpg.setRapportBilanB(details.getRapportBilanB());

        return bpgRepository.save(bpg);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        BilanPreGreffe bpg = bpgRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bilan pré-greffe non trouvé"));
        bpgRepository.delete(bpg);
    }
}