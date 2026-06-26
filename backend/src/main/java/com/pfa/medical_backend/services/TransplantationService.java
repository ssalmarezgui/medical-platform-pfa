package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TransplantationService {

    @Autowired
    private TransplantationRepository tRepository;

    @Autowired
    private PatientIdAdminRepository patientRepository;

    @Autowired
    private DonneurRepository donneurRepository;

    public List<Transplantation> getByPatient(String patientId) {
        return tRepository.findByPatient_IdentifiantP(patientId);
    }

    public List<Transplantation> getAll() {
        return tRepository.findAll();
    }

    public Optional<Transplantation> getById(Integer id) {
        return tRepository.findById(id);
    }

    @Transactional("transactionManager")
    public Transplantation create(Transplantation t, String patientId, Integer donneurId) {
        PatientIdAdmin patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            
        Donneur donneur = donneurRepository.findById(donneurId)
            .orElseThrow(() -> new RuntimeException("Donneur non trouvé"));

        t.setPatient(patient);
        t.setDonneur(donneur);
        return tRepository.save(t);
    }

    @Transactional("transactionManager")
    public Transplantation update(Integer id, Transplantation details) {
        Transplantation t = tRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        if (details.getDateTR() != null) t.setDateTR(details.getDateTR());
        if (details.getLieuDeLaGreffe() != null) t.setLieuDeLaGreffe(details.getLieuDeLaGreffe());
        if (details.getLieuDeSuivi() != null) t.setLieuDeSuivi(details.getLieuDeSuivi());
        if (details.getNbTransplantation() != null) t.setNbTransplantation(details.getNbTransplantation());
        if (details.getNbUretere() != null) t.setNbUretere(details.getNbUretere());
        if (details.getRein() != null) t.setRein(details.getRein());
        if (details.getNbArtereVeine() != null) t.setNbArtereVeine(details.getNbArtereVeine());
        if (details.getKystes() != null) t.setKystes(details.getKystes());
        if (details.getTypeAnomalie() != null) t.setTypeAnomalie(details.getTypeAnomalie());
        if (details.getDureeIschemieFroide() != null) t.setDureeIschemieFroide(details.getDureeIschemieFroide());
        if (details.getDureeIschemieChaude() != null) t.setDureeIschemieChaude(details.getDureeIschemieChaude());
        if (details.getLiquideConservation() != null) t.setLiquideConservation(details.getLiquideConservation());
        if (details.getLiquideRincage() != null) t.setLiquideRincage(details.getLiquideRincage());
        if (details.getMachineAPerfusion() != null) t.setMachineAPerfusion(details.getMachineAPerfusion());
        if (details.getTypeAnastomoseArterielle() != null) t.setTypeAnastomoseArterielle(details.getTypeAnastomoseArterielle());
        if (details.getTypeAnastomoseVeineuse() != null) t.setTypeAnastomoseVeineuse(details.getTypeAnastomoseVeineuse());
        if (details.getTypeAnastomoseUreteroVesicale() != null) t.setTypeAnastomoseUreteroVesicale(details.getTypeAnastomoseUreteroVesicale());
        if (details.getSondeEnDoubleJJ() != null) t.setSondeEnDoubleJJ(details.getSondeEnDoubleJJ());

        return tRepository.save(t);
    }

    @Transactional("transactionManager")
    public void delete(Integer id) {
        Transplantation t = tRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
        tRepository.delete(t);
    }
}