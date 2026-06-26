package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.NephropathieInitiale;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.NephropathieInitialeRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional("transactionManager")
public class NephropathieInitialeService {

    @Autowired
    private NephropathieInitialeRepository niRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    public List<NephropathieInitiale> getByPatient(String patientId) {
        return niRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<NephropathieInitiale> getAll() {
        return niRepository.findAll();
    }

    public Optional<NephropathieInitiale> getById(Integer id) {
        return niRepository.findById(id);
    }

    public NephropathieInitiale create(NephropathieInitiale ni, String patientId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        ni.setPatient(patient);
        return niRepository.save(ni);
    }

    public NephropathieInitiale update(Integer id, NephropathieInitiale details) {
        NephropathieInitiale ni = niRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Néphropathie non trouvée"));

        if (details.getTypeCliniqueNI() != null) ni.setTypeCliniqueNI(details.getTypeCliniqueNI());
        if (details.getCauseNI() != null) ni.setCauseNI(details.getCauseNI());
        if (details.getTypeHistologiqueNI() != null) ni.setTypeHistologiqueNI(details.getTypeHistologiqueNI());
        if (details.getStadeMaladiNI() != null) ni.setStadeMaladiNI(details.getStadeMaladiNI());

        return niRepository.save(ni);
    }

    public void delete(Integer id) {
        NephropathieInitiale ni = niRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Néphropathie non trouvée"));

        niRepository.deleteBilansByNiId(id);

        niRepository.deleteDialysesByNiId(id);

        niRepository.deleteBiopsiesByNiId(id);

        niRepository.delete(ni);
    }
}