package com.pfa.medical_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;

import com.pfa.medical_backend.entities.HopitalStructureSoin;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.HopitalStructureSoinRepository;
import com.pfa.medical_backend.repositories.ServiceRepository;
import com.pfa.medical_backend.repositories.UserRepository;


@Configuration
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
public class DataInitializerConfig {

    @Value("${app.bootstrap-admin.enabled:false}")
    private boolean bootstrapAdminEnabled;

    @Value("${app.bootstrap-admin.username:}")
    private String adminLogin;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap-admin.role:ADMIN}")
    private String adminRole;

    @Bean
    public CommandLineRunner bootstrapData(
        UserRepository userRepository,
        HopitalStructureSoinRepository hopitalRepository,
        ServiceRepository serviceRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (!bootstrapAdminEnabled) {
                return;
            }

            if (!StringUtils.hasText(adminLogin) || !StringUtils.hasText(adminPassword)) {
                throw new IllegalStateException(
                    "Admin bootstrap is enabled but credentials are missing."
                );
            }

            // 1. INITIALISATION SYNCHRONE DES 6 HÔPITAUX DE RÉFÉRENCE TUNISIENS (MCD strict)
            HopitalStructureSoin hcn = bootstrapHopital(hopitalRepository, serviceRepository, 
                "HCN_TUNIS1", "HCN", "Boulevard du 9 avril 1938-Bab Saâdoun-1007-Tunisia", 30, 30, 1025, 
                "Hôpital universitaire de référence nationale. Dispose d'un service de néphrologie et transplantation rénale de renommée nationale, avec un plateau technique de pointe.", 
                LocalDate.of(1938, 4, 9));

            bootstrapHopital(hopitalRepository, serviceRepository, 
                "LA_RABTA_1", "La Rabta", "La Rabta, Tunis-1007 – Beb Saadoun", 12, 34, 872, 
                "Grand hôpital universitaire situé au cœur de Tunis, spécialisé dans la prise en charge des maladies chroniques dont les pathologies rénales.", 
                LocalDate.of(1895, 1, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, 
                "HMPIT_TUN1", "HMPIT", "Montfleury, Tunis-1008, Tunisie", 3, 15, 620, 
                "Hôpital militaire universitaire de référence assurant des soins spécialisés pour le personnel militaire et civil.", 
                LocalDate.of(1900, 1, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, 
                "SAHLOUL_S1", "Sahloul", "Route de Ceinture Sahloul, Hammam‑Sousse 4011, Sousse, Tunisie", 12, 30, 700, 
                "Hôpital universitaire régional de référence du Centre-Est tunisien. Son service de néphrologie prend en charge les patients insuffisants rénaux chroniques.", 
                LocalDate.of(1900, 1, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, 
                "FATTOUMA_1", "Fattouma Bourguiba", "Avenue Farhat‑Hached et Rue du 1er Juin 1995, Monastir 5000, Tunisie", 13, 39, 888, 
                "Hôpital universitaire de la région du Sahel. Reconnu pour son excellence en médecine interne et néphrologie.", 
                LocalDate.of(1900, 1, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, 
                "H_CHAKER_1", "Hédi Chaker", "Route El Ain Km 0,5, 3000 Sfax, Tunisie", 13, 18, 889, 
                "Principal hôpital universitaire du Sud tunisien. Dispose d'un service de néphrologie et dialyse très actif couvrant toute la région sud.", 
                LocalDate.of(1900, 1, 1));

            // 2. RECUPÉRER LE SERVICE DE NÉPHROLOGIE DE RÉFÉRENCE (HCN) POUR ASSIGNATION DES COMPTES DEMO
            ServiceMedical referenceService = serviceRepository.findAll().stream()
                .filter(s -> s.getHopital() != null && "HCN_TUNIS1".equals(s.getHopital().getIdentifiantH()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Service de référence de HCN introuvable"));

            // 3. INITIALISATION ET SYNCHRONISATION DES UTILISATEURS SUR LE SERVICE DE RÉFÉRENCE
            User admin = userRepository.findByLoginU(adminLogin).orElseGet(User::new);
            admin.setLoginU(adminLogin);
            admin.setMotPasseU(passwordEncoder.encode(adminPassword));
            admin.setRoleU(adminRole);
            admin.setService(referenceService);
            admin.setAccountNonLocked(true);
            userRepository.save(admin);
            System.out.println("Admin synchronized: " + adminLogin + " (" + adminRole + ") rattaché à HCN");

            bootstrapDemoUser(userRepository, passwordEncoder, "investigateur", "Invest1234!", "MEDECIN_INVESTIGATEUR", referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "suivi", "Suivi1234!", "MEDECIN_SUIVI", referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "labo", "Labo1234!", "AGENT_LABORATOIRE", referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "immuno", "Immuno1234!", "AGENT_IMMUNO", referenceService);
        };
    }

    private void bootstrapDemoUser(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        String login,
        String password,
        String role,
        ServiceMedical service
    ) {
        User user = userRepository.findByLoginU(login).orElseGet(User::new);
        user.setLoginU(login);
        user.setMotPasseU(passwordEncoder.encode(password));
        user.setRoleU(role);
        user.setService(service);
        user.setAccountNonLocked(true); 
        userRepository.save(user);
        System.out.println("Demo user synchronized: " + login + " (" + role + ")");
    }

    // Méthode de synchronisation automatique d'un hôpital et de son service Nephrologie associé
    private HopitalStructureSoin bootstrapHopital(
        HopitalStructureSoinRepository hopitalRepository,
        ServiceRepository serviceRepository,
        String id,
        String libelle,
        String adresse,
        Integer blocs,
        Integer servicesCount,
        Integer lits,
        String description,
        LocalDate creationDate
    ) {
        HopitalStructureSoin hopital = hopitalRepository.findById(id).orElseGet(HopitalStructureSoin::new);
        hopital.setIdentifiantH(id);
        hopital.setLibelleH(libelle);
        hopital.setAdresseH(adresse);
        hopital.setNbBlocH(blocs);
        hopital.setNbServiceH(servicesCount);
        hopital.setNbLitsH(lits);
        hopital.setDescriptionH(description);
        hopital.setDateCreationH(creationDate);

        HopitalStructureSoin saved = hopitalRepository.save(hopital);

        // On vérifie s'il possède déjà un service, sinon on lui crée son service de Néphrologie
        boolean hasService = serviceRepository.findAll().stream()
            .anyMatch(s -> s.getHopital() != null && id.equals(s.getHopital().getIdentifiantH()));

        if (!hasService) {
            ServiceMedical service = new ServiceMedical();
            service.setLibelleS("Néphrologie");
            service.setHopital(saved);
            serviceRepository.save(service);
        }

        return saved;
    }
}