package com.pfa.medical_backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;

@RestController
@RequestMapping("/api/references")
public class ReferenceController {

    private final ComorbiditeRepository comorbiditeRepo;
    private final AntecedentMedicalRepository antMedRepo;
    private final AntecedentChirurgicalRepository antChirRepo;
    private final NephropathieInitialeRepository nephroRepo;
    private final EffetSecondaireRepository effetRepo;

    public ReferenceController(
        ComorbiditeRepository comorbiditeRepo,
        AntecedentMedicalRepository antMedRepo,
        AntecedentChirurgicalRepository antChirRepo,
        NephropathieInitialeRepository nephroRepo,
        EffetSecondaireRepository effetRepo
    ) {
        this.comorbiditeRepo = comorbiditeRepo;
        this.antMedRepo = antMedRepo;
        this.antChirRepo = antChirRepo;
        this.nephroRepo = nephroRepo;
        this.effetRepo = effetRepo;
    }

    @GetMapping("/comorbidites")
    public List<Comorbidite> getComorbidites() { 
        return comorbiditeRepo.findAll(); 
    }

    @GetMapping("/nephropathies")
    public List<NephropathieInitiale> getNephropathies() { 
        return nephroRepo.findAll(); 
    }

    @GetMapping("/effets-secondaires")
    public List<EffetSecondaire> getEffets() { 
        return effetRepo.findAll(); 
    }

    @GetMapping("/antecedents-medicaux")
    public List<AntecedentMedical> getAntMed() { 
        return antMedRepo.findAll(); 
    }

    @GetMapping("/antecedents-chirurgicaux")
    public List<AntecedentChirurgical> getAntChir() { 
        return antChirRepo.findAll(); 
    }
}