package com.pfa.medical_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

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

            ServiceMedical defaultService = serviceRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> createDefaultService(hopitalRepository, serviceRepository));

            // Initialisation de l'admin
            User admin = userRepository.findByLoginU(adminLogin).orElseGet(User::new);
            admin.setLoginU(adminLogin);
            admin.setMotPasseU(passwordEncoder.encode(adminPassword));
            admin.setRoleU(adminRole);
            if (admin.getService() == null) {
                admin.setService(defaultService);
            }
            userRepository.save(admin);
            System.out.println("Admin synchronized: " + adminLogin + " (" + adminRole + ")");

            bootstrapDemoUser(userRepository, passwordEncoder, "investigateur", "Invest1234!", "MEDECIN_INVESTIGATEUR", defaultService);
            bootstrapDemoUser(userRepository, passwordEncoder, "suivi", "Suivi1234!", "MEDECIN_SUIVI", defaultService);
            bootstrapDemoUser(userRepository, passwordEncoder, "labo", "Labo1234!", "AGENT_LABORATOIRE", defaultService);
            bootstrapDemoUser(userRepository, passwordEncoder, "immuno", "Immuno1234!", "AGENT_IMMUNO", defaultService);
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
        if (user.getService() == null) {
            user.setService(service);
        }
        userRepository.save(user);
        System.out.println("Demo user synchronized: " + login + " (" + role + ")");
    }

    private ServiceMedical createDefaultService(
        HopitalStructureSoinRepository hopitalRepository,
        ServiceRepository serviceRepository
    ) {
        HopitalStructureSoin hopital = new HopitalStructureSoin();
        hopital.setIdentifiantH("ADMIN_HOSP");
        hopital.setLibelleH("Hopital par defaut");
        hopital.setDescriptionH("Structure creee automatiquement pour le compte admin");
        hopital.setDateCreationH(LocalDate.now());

        HopitalStructureSoin savedHopital = hopitalRepository.save(hopital);

        ServiceMedical service = new ServiceMedical();
        service.setLibelleS("Service par defaut");
        service.setHopital(savedHopital);
        return serviceRepository.save(service);
    }
}