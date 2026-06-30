package com.pfa.medical_backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;

@RestController
@RequestMapping("/api/references")

public class ReferenceController {

    @Autowired private ComorbiditeRepository comorbiditeRepo;
    @Autowired private AntecedentMedicalRepository antMedRepo;
    @Autowired private AntecedentChirurgicalRepository antChirRepo;
    @Autowired private NephropathieInitialeRepository nephroRepo;
    @Autowired private EffetSecondaireRepository effetRepo;

    @GetMapping("/comorbidites")
    public List<Comorbidite> getComorbidites() { return comorbiditeRepo.findAll(); }

    @GetMapping("/nephropathies")
    public List<NephropathieInitiale> getNephropathies() { return nephroRepo.findAll(); }

    @GetMapping("/effets-secondaires")
    public List<EffetSecondaire> getEffets() { return effetRepo.findAll(); }

    @GetMapping("/antecedents-medicaux")
    public List<AntecedentMedical> getAntMed() { return antMedRepo.findAll(); }

    @GetMapping("/antecedents-chirurgicaux")
    public List<AntecedentChirurgical> getAntChir() { return antChirRepo.findAll(); }
}