package com.pfa.medical_backend.config;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.*;

import java.time.LocalDate;

@Configuration
@ConditionalOnProperty(name = "app.test-data.enabled", havingValue = "true")
public class TestDataConfig {

    private static final Logger log = LoggerFactory.getLogger(TestDataConfig.class);

    private static final String NATIONALITE_TUNISIENNE = "Tunisienne";
    private static final String EVOLUTION_STABLE = "Stable";

    @Bean
    public CommandLineRunner seedTestData(
        HopitalStructureSoinRepository hopitalRepo,
        ServiceRepository serviceRepo,
        MedecinRepository medecinRepo,
        PatientIdAdminRepository patientRepo,
        DonneurRepository donneurRepo,
        TransplantationRepository transplantationRepo,
        NephropathieInitialeRepository nephropathieRepo,
        GreffeRepository greffeRepo,
        BilanPreGreffeRepository bilanPreGreffeRepo,
        TraitementImmunoSuppresseurRepository tisRepo,
        MedicamentRepository medicamentRepo,
        EffetSecondaireRepository effetSecondaireRepo,
        //HospitalisationPostTransplantationRepository hospitalisationRepo,
        // EvolutionRenaleRepository evolutionRenaleRepo,
        ComorbiditeRepository comorbiditeRepo,
        DialyseRepository dialyseRepo,
        AntecedentMedicalRepository antecedentMedRepo,
        AntecedentChirurgicalRepository antecedentChirRepo
    ) {
        return args -> {
            if (patientRepo.count() > 0) {
                log.info("[TestData] Data already present, skipping seed.");
                return;
            }

            // Hôpitaux
            HopitalStructureSoin h1 = new HopitalStructureSoin();
            h1.setIdentifiantH("HOSP-TUN01");
            h1.setLibelleH("CHU de Tunis");
            h1.setAdresseH("1 Av. Jebal Lakhdar, Tunis 1007");
            h1.setNbBlocH(8);
            h1.setNbServiceH(12);
            h1.setNbLitsH(450);
            h1.setDescriptionH("Centre Hospitalo-Universitaire principal");
            h1.setDateCreationH(LocalDate.now());
            HopitalStructureSoin savedH1 = hopitalRepo.save(h1);

            HopitalStructureSoin h2 = new HopitalStructureSoin();
            h2.setIdentifiantH("HOSP-TUN02");
            h2.setLibelleH("Hôpital Charles Nicolle");
            h2.setAdresseH("Bab Saadoun, Tunis 1006");
            h2.setNbBlocH(5);
            h2.setNbServiceH(8);
            h2.setNbLitsH(300);
            h2.setDescriptionH("Hôpital universitaire spécialisé");
            h2.setDateCreationH(LocalDate.now());
            HopitalStructureSoin savedH2 = hopitalRepo.save(h2);

            // Services 
            ServiceMedical s1 = new ServiceMedical();
            s1.setLibelleS("Service de Néphrologie");
            s1.setNbLitsS(40);
            s1.setNbChambresS(10);
            s1.setNbMedecinsS(5);
            s1.setHopital(savedH1);
            ServiceMedical savedS1 = serviceRepo.save(s1);

            ServiceMedical s2 = new ServiceMedical();
            s2.setLibelleS("Service de Transplantation");
            s2.setNbLitsS(20);
            s2.setNbChambresS(8);
            s2.setNbMedecinsS(4);
            s2.setHopital(savedH1);
            ServiceMedical savedS2 = serviceRepo.save(s2);

            ServiceMedical s3 = new ServiceMedical();
            s3.setLibelleS("Service d'Urologie");
            s3.setNbLitsS(30);
            s3.setNbChambresS(10);
            s3.setNbMedecinsS(6);
            s3.setHopital(savedH2);
            ServiceMedical savedS3 = serviceRepo.save(s3);

            // Médecins
            Medecin m1 = new Medecin();
            m1.setNomM("Ben Ali");
            m1.setPrenomM("Ahmed");
            m1.setSexeM("M");
            m1.setSpecialiteM("Néphrologie");
            m1.setNumTelM("+216 71 234 567");
            m1.setNumTelWhapAPPM("+216 22 234 567");
            m1.setAdresseDomM("12 Rue de la Liberté, Tunis");
            m1.setService(savedS1);
            Medecin savedM1 = medecinRepo.save(m1);

            Medecin m2 = new Medecin();
            m2.setNomM("Mansour");
            m2.setPrenomM("Sonia");
            m2.setSexeM("F");
            m2.setSpecialiteM("Transplantation rénale");
            m2.setNumTelM("+216 71 345 678");
            m2.setNumTelWhapAPPM("+216 22 345 678");
            m2.setAdresseDomM("45 Avenue Bourguiba, Tunis");
            m2.setService(savedS2);
            Medecin savedM2 = medecinRepo.save(m2);

            Medecin m3 = new Medecin();
            m3.setNomM("Trabelsi");
            m3.setPrenomM("Karim");
            m3.setSexeM("M");
            m3.setSpecialiteM("Urologie");
            m3.setNumTelM("+216 71 456 789");
            m3.setNumTelWhapAPPM("+216 22 456 789");
            m3.setAdresseDomM("7 Rue Ibn Khaldoun, Tunis");
            m3.setService(savedS3);
            Medecin savedM3 = medecinRepo.save(m3);

            // Patients
            PatientIdAdmin p1 = new PatientIdAdmin();
            p1.setNomP("Khalil");
            p1.setPrenomP("Mohamed");
            p1.setNationaliteP(NATIONALITE_TUNISIENNE);
            p1.setSexeP("M");
            p1.setOrigineGeogP("Tunis");
            p1.setAdresseP("23 Rue Habib Thameur, Tunis");
            p1.setTelephoneP("+216 55 123 456");
            p1.setAdressEmailP("m.khalil@email.tn");
            p1.setAdulteP(true);
            p1.setStatut("Transplanté");
            p1.setEvolution(EVOLUTION_STABLE);
            p1.setNiveauEducation("Universitaire");
            p1.setEnEtatActivite(true);
            p1.setMedecinInvestigateur(savedM1);
            patientRepo.save(p1);

            PatientIdAdmin p2 = new PatientIdAdmin();
            p2.setNomP("Haddad");
            p2.setPrenomP("Fatma");
            p2.setNationaliteP(NATIONALITE_TUNISIENNE);
            p2.setSexeP("F");
            p2.setOrigineGeogP("Sfax");
            p2.setAdresseP("8 Rue de la République, Sfax");
            p2.setTelephoneP("+216 55 234 567");
            p2.setAdressEmailP("f.haddad@email.tn");
            p2.setAdulteP(true);
            p2.setStatut("En attente");
            p2.setEvolution(EVOLUTION_STABLE);
            p2.setNiveauEducation("Secondaire");
            p2.setEnEtatActivite(false);
            p2.setMedecinInvestigateur(savedM2);
            patientRepo.save(p2);

            PatientIdAdmin p3 = new PatientIdAdmin();
            p3.setNomP("Ben Salem");
            p3.setPrenomP("Ali");
            p3.setNationaliteP(NATIONALITE_TUNISIENNE);
            p3.setSexeP("M");
            p3.setOrigineGeogP("Sousse");
            p3.setAdresseP("15 Avenue Mohamed V, Sousse");
            p3.setTelephoneP("+216 55 345 678");
            p3.setAdressEmailP("a.bensalem@email.tn");
            p3.setAdulteP(true);
            p3.setStatut("Transplanté");
            p3.setEvolution("Amélioration");
            p3.setNiveauEducation("Primaire");
            p3.setEnEtatActivite(true);
            p3.setMedecinInvestigateur(savedM1);
            patientRepo.save(p3);

            PatientIdAdmin p4 = new PatientIdAdmin();
            p4.setNomP("Bouaziz");
            p4.setPrenomP("Sara");
            p4.setNationaliteP(NATIONALITE_TUNISIENNE);
            p4.setSexeP("F");
            p4.setOrigineGeogP("Bizerte");
            p4.setAdresseP("3 Rue de la Corniche, Bizerte");
            p4.setTelephoneP("+216 55 456 789");
            p4.setAdressEmailP("s.bouaziz@email.tn");
            p4.setAdulteP(true);
            p4.setStatut("Dialysé");
            p4.setEvolution(EVOLUTION_STABLE);
            p4.setNiveauEducation("Universitaire");
            p4.setEnEtatActivite(false);
            p4.setMedecinInvestigateur(savedM3);
            patientRepo.save(p4);

            // Donneurs
            Donneur d1 = new Donneur();
            d1.setNomD("Ridha");
            d1.setPrenomD("Youssef");
            d1.setNationaliteD(NATIONALITE_TUNISIENNE);
            d1.setSexeD("M");
            d1.setOrigineGeogD("Tunis");
            d1.setAdresseDomD("10 Rue du Lac, Tunis");
            d1.setTelephoneD("+216 55 567 890");
            d1.setAdresseEmailD("y.ridha@email.tn");
            d1.setAdulteD(true);
            d1.setTypeDonneur("Vivant");
            d1.setStatut("Actif");
            d1.setEvolutionProf("Bon état général");
            donneurRepo.save(d1);

            Donneur d2 = new Donneur();
            d2.setNomD("Dridi");
            d2.setPrenomD("Amina");
            d2.setNationaliteD(NATIONALITE_TUNISIENNE);
            d2.setSexeD("F");
            d2.setOrigineGeogD("Nabeul");
            d2.setAdresseDomD("22 Avenue de la Plage, Nabeul");
            d2.setTelephoneD("+216 55 678 901");
            d2.setAdulteD(true);
            d2.setTypeDonneur("Décédé");
            d2.setStatut("Décédé");
            donneurRepo.save(d2);



            
            // Médicaments
            Medicament med1 = new Medicament();
            med1.setNomCommercialMed("Prograf");
            med1.setTypeMed("Anticalcineurine (Tacrolimus)");
            med1.setPosologieMed("1mg");
            med1.setDescriptionMed("Prévention du rejet de greffe rénale.");
            medicamentRepo.save(med1);

            Medicament med2 = new Medicament(); 
            med2.setNomCommercialMed("CellCept");
            med2.setTypeMed("Antimétabolite (MMF)");
            med2.setPosologieMed("500mg");
            med2.setDescriptionMed("Traitement d'entretien.");
            medicamentRepo.save(med2);

            // Effets secondaires
            EffetSecondaire es1 = new EffetSecondaire();
            es1.setLibelleEFS("Néphrotoxicité");
            es1.setDescriptionEFS("Toxicité rénale induite par le Tacrolimus");
            es1.setRecommendationEFS("Réduire la dose, surveiller la créatininémie hebdomadairement");
            effetSecondaireRepo.save(es1);

            EffetSecondaire es2 = new EffetSecondaire();
            es2.setLibelleEFS("Diabète post-transplantation");
            es2.setDescriptionEFS("Hyperglycémie induite par les immunosuppresseurs");
            es2.setRecommendationEFS("Contrôle glycémique strict, adapter le traitement corticoïde");
            effetSecondaireRepo.save(es2);
   
            // Comorbidités
            Comorbidite c1 = new Comorbidite();
            c1.setDiabete(false);
            c1.setCardiaque(true);
            comorbiditeRepo.save(c1);

            Comorbidite c2 = new Comorbidite();
            c2.setDiabete(true);
            c2.setCardiaque(false);
            comorbiditeRepo.save(c2);

            // Dialyses
            Dialyse dl1 = new Dialyse();
            dl1.setTypeDialyse("Hémodialyse");
            dialyseRepo.save(dl1);

            Dialyse dl2 = new Dialyse();
            dl2.setTypeDialyse("Dialyse péritonéale ambulatoire continue");
            dialyseRepo.save(dl2);

            log.info("[TestData] ✓ Données insérées : 2 hôpitaux, 3 services, 3 médecins, 4 patients, 2 donneurs et les entités associées.");
        };
    }
}