package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.Dialyse;
import com.pfa.medical_backend.entities.NephropathieInitiale;
import com.pfa.medical_backend.repositories.DialyseRepository;
import com.pfa.medical_backend.repositories.NephropathieInitialeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DialyseService {

    private final DialyseRepository dialyseRepository;
    private final NephropathieInitialeRepository niRepository;

    public DialyseService(
        DialyseRepository dialyseRepository,
        NephropathieInitialeRepository niRepository
    ) {
        this.dialyseRepository = dialyseRepository;
        this.niRepository = niRepository;
    }

    public List<Dialyse> getByNephropathie(Integer nephropathieId) {
        return dialyseRepository.findByNephropathie_IdentifiantNI(nephropathieId);
    }

    public List<Dialyse> getAll() {
        return dialyseRepository.findAll();
    }

    public Optional<Dialyse> getById(Integer id) {
        return dialyseRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Dialyse create(Dialyse d, Integer nephropathieId) {
        NephropathieInitiale ni = niRepository.findById(nephropathieId)
            .orElseThrow(() -> new RuntimeException("Néphropathie non trouvée"));
        d.setNephropathie(ni);
        return dialyseRepository.save(d);
    }

    @Transactional("transactionManager")
    public Dialyse update(Integer id, Dialyse details) {
        Dialyse d = dialyseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier de dialyse non trouvé"));

        if (details.getTypeDialyse() != null) d.setTypeDialyse(details.getTypeDialyse());
        
        return dialyseRepository.save(d);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Dialyse d = dialyseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier de dialyse non trouvé"));
        dialyseRepository.delete(d);
    }
}