package com.pfa.medical_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.Month;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import com.pfa.medical_backend.entities.HopitalStructureSoin;
import com.pfa.medical_backend.entities.Role;
import com.pfa.medical_backend.entities.Permission;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.HopitalStructureSoinRepository;
import com.pfa.medical_backend.repositories.RoleRepository;
import com.pfa.medical_backend.repositories.PermissionRepository;
import com.pfa.medical_backend.repositories.ServiceRepository;
import com.pfa.medical_backend.repositories.UserRepository;

@Configuration
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
public class DataInitializerConfig {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerConfig.class);

    private static final String READ_PATIENT = "READ_PATIENT";
    private static final String READ_DONNEUR = "READ_DONNEUR";
    private static final String READ_MEDECIN = "READ_MEDECIN";
    private static final String READ_SERVICE = "READ_SERVICE";
    private static final String READ_HOPITAL = "READ_HOPITAL";
    private static final String READ_LABO = "READ_LABO";
    private static final String READ_IMMUNO = "READ_IMMUNO";



    @Value("${app.bootstrap-admin.enabled:false}")
    private boolean bootstrapAdminEnabled;

    @Value("${app.bootstrap-admin.username:}")
    private String adminLogin;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap-admin.role:ROLE_ADMIN}")
    private String adminRole;

    @Bean
    public CommandLineRunner bootstrapData(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PermissionRepository permissionRepository,
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

            Role roleAdmin = bootstrapRole(roleRepository, permissionRepository, "ROLE_ADMIN", Set.of(
                READ_PATIENT, "WRITE_PATIENT", "DELETE_PATIENT",
                READ_DONNEUR, "WRITE_DONNEUR", "DELETE_DONNEUR",
                READ_MEDECIN, "WRITE_MEDECIN",
                READ_SERVICE, "WRITE_SERVICE",
                READ_HOPITAL, "WRITE_HOPITAL",
                READ_LABO,
                READ_IMMUNO
            ));

            Role roleSuivi = bootstrapRole(roleRepository, permissionRepository, "ROLE_MEDECIN_SUIVI", Set.of(
                READ_PATIENT, READ_DONNEUR, READ_MEDECIN, READ_SERVICE, READ_HOPITAL, READ_LABO,
                READ_IMMUNO, "WRITE_IMMUNO"
            ));

            Role roleInvestigateur = bootstrapRole(roleRepository, permissionRepository, "ROLE_MEDECIN_INVESTIGATEUR", Set.of(
                READ_PATIENT, "WRITE_PATIENT", READ_DONNEUR, "WRITE_DONNEUR", "DELETE_DONNEUR", READ_MEDECIN, READ_SERVICE, READ_HOPITAL, READ_LABO
            ));

            Role roleLabo = bootstrapRole(roleRepository, permissionRepository, "ROLE_AGENT_LABORATOIRE", Set.of(READ_PATIENT, READ_DONNEUR, READ_LABO, "WRITE_LABO"));
            Role roleImmuno = bootstrapRole(roleRepository, permissionRepository, "ROLE_AGENT_IMMUNO", Set.of(READ_PATIENT, READ_DONNEUR,
                READ_IMMUNO, "WRITE_IMMUNO_COMPLICATION"
            ));


            HopitalStructureSoin hcnInput = new HopitalStructureSoin();
            hcnInput.setIdentifiantH("HCN_TUNIS1");
            hcnInput.setLibelleH("HCN");
            hcnInput.setAdresseH("Boulevard du 9 avril 1938-Bab Saâdoun-1007-Tunisia");
            hcnInput.setNbBlocH(30);
            hcnInput.setNbServiceH(30);
            hcnInput.setNbLitsH(1025);
            hcnInput.setDescriptionH("Hôpital universitaire de référence nationale.");
            hcnInput.setDateCreationH(LocalDate.of(1938, Month.APRIL, 9));

            bootstrapHopital(hopitalRepository, serviceRepository, hcnInput);

            HopitalStructureSoin rabtaInput = new HopitalStructureSoin();
            rabtaInput.setIdentifiantH("LA_RABTA_1");
            rabtaInput.setLibelleH("La Rabta");
            rabtaInput.setAdresseH("La Rabta, Tunis-1007 – Beb Saadoun");
            rabtaInput.setNbBlocH(12);
            rabtaInput.setNbServiceH(34);
            rabtaInput.setNbLitsH(872);
            rabtaInput.setDescriptionH("Grand hôpital universitaire situé au cœur de Tunis.");
            rabtaInput.setDateCreationH(LocalDate.of(1895, Month.JANUARY, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, rabtaInput);

            HopitalStructureSoin hmpitInput = new HopitalStructureSoin();
            hmpitInput.setIdentifiantH("HMPIT_TUN1");
            hmpitInput.setLibelleH("HMPIT");
            hmpitInput.setAdresseH("Montfleury, Tunis-1008, Tunisie");
            hmpitInput.setNbBlocH(3);
            hmpitInput.setNbServiceH(15);
            hmpitInput.setNbLitsH(620);
            hmpitInput.setDescriptionH("Hôpital militaire universitaire de référence.");
            hmpitInput.setDateCreationH(LocalDate.of(1900, Month.JANUARY, 1));

            bootstrapHopital(hopitalRepository, serviceRepository, hmpitInput);

            ServiceMedical referenceService = serviceRepository.findAll().stream()
                .filter(s -> s.getHopital() != null && "HCN_TUNIS1".equals(s.getHopital().getIdentifiantH()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Service de référence de HCN introuvable"));

            User admin = userRepository.findByLoginU(adminLogin).orElseGet(User::new);
            admin.setLoginU(adminLogin);
            admin.setMotPasseU(passwordEncoder.encode(adminPassword));
            admin.setRole(roleAdmin);
            admin.setService(referenceService);
            admin.setAccountNonLocked(true);
            userRepository.save(admin);
            log.info("Admin synchronized: {} ({}) rattaché à HCN", adminLogin, adminRole);

            bootstrapDemoUser(userRepository, passwordEncoder, "investigateur", "Invest1234!", roleInvestigateur, referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "suivi", "Suivi1234!", roleSuivi, referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "labo", "Labo1234!", roleLabo, referenceService);
            bootstrapDemoUser(userRepository, passwordEncoder, "immuno", "Immuno1234!", roleImmuno, referenceService);
        };
    }

    private Permission bootstrapPermission(PermissionRepository permissionRepository, String permissionName) {
        return permissionRepository.findByNomPermission(permissionName).orElseGet(() -> {
            Permission permission = new Permission();
            permission.setNomPermission(permissionName);
            return permissionRepository.save(permission);
        });
    }

    private Role bootstrapRole(RoleRepository roleRepository, PermissionRepository permissionRepository, String roleName, Set<String> permissionNames){
        Role role = roleRepository.findByNomRole(roleName).orElseGet(() -> {
            Role newRole = new Role();
            newRole.setNomRole(roleName);
            newRole.setPermissions(new HashSet<>());
            return roleRepository.saveAndFlush(newRole);
        });

        Set<Permission> permissions = new HashSet<>();
        for (String pName : permissionNames) {
            Permission perm = bootstrapPermission(permissionRepository, pName);
            permissions.add(perm);
        }
        
        role.setPermissions(permissions);
        return roleRepository.saveAndFlush(role);
    }

    private void bootstrapDemoUser(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        String login,
        String password,
        Role role,
        ServiceMedical service
    ) {
        User user = userRepository.findByLoginU(login).orElseGet(User::new);
        user.setLoginU(login);
        user.setMotPasseU(passwordEncoder.encode(password));
        user.setRole(role);
        user.setService(service);
        user.setAccountNonLocked(true); 
        userRepository.save(user);
        log.info("Demo user synchronized: {} ({})", login, role.getNomRole());
    }

    private HopitalStructureSoin bootstrapHopital(
        HopitalStructureSoinRepository hopitalRepository,
        ServiceRepository serviceRepository,
        HopitalStructureSoin data
    ) {
        String id = data.getIdentifiantH();
        
        HopitalStructureSoin hopital = hopitalRepository.findById(id).orElseGet(HopitalStructureSoin::new);
        hopital.setIdentifiantH(id);
        hopital.setLibelleH(data.getLibelleH());
        hopital.setAdresseH(data.getAdresseH());
        hopital.setNbBlocH(data.getNbBlocH());
        hopital.setNbServiceH(data.getNbServiceH());
        hopital.setNbLitsH(data.getNbLitsH());
        hopital.setDescriptionH(data.getDescriptionH());
        hopital.setDateCreationH(data.getDateCreationH());

        HopitalStructureSoin saved = hopitalRepository.save(hopital);

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