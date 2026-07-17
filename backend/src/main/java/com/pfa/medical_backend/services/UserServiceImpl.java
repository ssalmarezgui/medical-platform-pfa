package com.pfa.medical_backend.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage; 
import org.springframework.mail.javamail.JavaMailSender;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.entities.Role;
import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.repositories.RoleRepository;
import com.pfa.medical_backend.repositories.MedecinRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Service 
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final AuditLogService auditLogService;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, 
                           MedecinRepository medecinRepository, PasswordEncoder passwordEncoder,
                           JavaMailSender mailSender, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.medecinRepository = medecinRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender; 
        this.auditLogService = auditLogService;
    }
    
    @Override
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if(userRepository.existsByLoginU(dto.getLoginU())){
            throw new IllegalArgumentException("Ce login est déjà utilisé");
        }

        User user = new User();
        user.setUuid(UUID.randomUUID().toString());
        user.setLoginU(dto.getLoginU());
        user.setEmailU(dto.getEmailU()); 
        user.setMotPasseU(passwordEncoder.encode(dto.getMotPasseU()));
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setActive(false); 

        String medecinName = "";

        if (dto.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new EntityNotFoundException("Matricule médecin invalide ou non enregistré par l'administration."));
            
            if (medecin.getUtilisateur() != null) {
                throw new IllegalArgumentException("Un compte de connexion est déjà enregistré pour ce matricule de médecin.");
            }

            user.setMedecin(medecin);
            user.setService(medecin.getService());
            medecinName = medecin.getPrenomM() + " " + medecin.getNomM();

            String targetRoleName = "ROLE_MEDECIN_SUIVI";
            
            if (medecin.getTypeMedecin() != null) {
                switch (medecin.getTypeMedecin()) {
                    case SUIVI:
                        targetRoleName = "ROLE_MEDECIN_SUIVI";
                        break;
                    case INVESTIGATEUR:
                        targetRoleName = "ROLE_MEDECIN_INVESTIGATEUR";
                        break;
                }
            }

            final String finalTargetRoleName = targetRoleName;

            Role role = roleRepository.findByNomRole(finalTargetRoleName)
                .orElseThrow(() -> new EntityNotFoundException("Rôle de sécurité non configuré : " + finalTargetRoleName));
            
            user.setRole(role);
        } else {
            Role role = roleRepository.findByNomRole(dto.getRoleU())
                    .orElseThrow(() -> new EntityNotFoundException("Rôle introuvable : " + dto.getRoleU()));
            user.setRole(role);
        }

        User savedUser = userRepository.save(user);

        auditLogService.log(savedUser.getLoginU(), "ROLE_USER", "INSCRIPTION_COMPTE", 
                "Médecin: " + medecinName, "Création de compte en attente de validation.");

        sendPendingEmailToDoctor(savedUser.getEmailU(), savedUser.getLoginU());
        sendAdminAlertEmail(savedUser.getLoginU(), medecinName);

        return mapToResponseDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getPendingUsers() {
        return userRepository.findByActive(false).stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public UserResponseDTO approveUser(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        
        user.setActive(true); 
        User approvedUser = userRepository.save(user);

        auditLogService.logAuto("VALIDATION_COMPTE", "Utilisateur: " + approvedUser.getLoginU(), 
                "Compte validé et accès autorisé par l'administrateur.");

        sendActivationEmailToDoctor(approvedUser.getEmailU(), approvedUser.getLoginU());

        return mapToResponseDTO(approvedUser);
    }

    @Override
    public UserResponseDTO toggleUserStatus(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        
        boolean newStatus = !user.isActive(); 
        user.setActive(newStatus);
        User updatedUser = userRepository.save(user);
        String actionLog = newStatus ? "REACTIVATION_COMPTE" : "SUSPENSION_COMPTE";
        String detailLog = newStatus ? "Accès réactivé par l'administrateur." : "Accès suspendu par l'administrateur.";
        
        auditLogService.logAuto(actionLog, "Utilisateur: " + updatedUser.getLoginU(), detailLog);

        if (newStatus) {
            sendActivationEmailToDoctor(updatedUser.getEmailU(), updatedUser.getLoginU());
        } else {
            sendSuspensionEmailToDoctor(updatedUser.getEmailU(), updatedUser.getLoginU());
        }

        return mapToResponseDTO(updatedUser);
    }

    private void sendPendingEmailToDoctor(String recipientEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("MedPlatform - Inscription en cours de validation");
            message.setText("Bonjour,\n\n" +
                    "Votre inscription sur MedPlatform a été reçue.\n" +
                    "Pour des raisons de sécurité, votre compte (Identifiant : " + username + ") est actuellement en cours de vérification par notre équipe administrative.\n\n" +
                    "Vous recevrez un email dès que votre compte sera activé.\n\n" +
                    "Cordialement,\nL'équipe administrative.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email médecin : " + e.getMessage());
        }
    }

    private void sendAdminAlertEmail(String username, String doctorName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo("ssalmarezgui@gmail.com"); 
            message.setSubject("ALERTE : Nouveau compte médecin en attente de validation");
            message.setText("Bonjour Administrateur,\n\n" +
                    "Un nouveau médecin s'est inscrit sur la plateforme :\n" +
                    "- Nom : " + doctorName + "\n" +
                    "- Identifiant de connexion : " + username + "\n\n" +
                    "Veuillez vous connecter sur votre tableau de bord de validation pour analyser et activer son compte.\n\n" +
                    "Lien de connexion : http://localhost:5173/login");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email alerte admin : " + e.getMessage());
        }
    }

    private void sendActivationEmailToDoctor(String recipientEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("MedPlatform - Votre compte a été activé !");
            message.setText("Félicitations Dr.,\n\n" +
                    "Votre compte MedPlatform (Identifiant : " + username + ") a été validé et activé par l'administration.\n\n" +
                    "Vous pouvez dès à présent vous connecter et accéder à votre espace sécurisé.\n\n" +
                    "Cordialement,\nL'équipe de l'administration médicale.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email activation : " + e.getMessage());
        }
    }

    private void sendSuspensionEmailToDoctor(String recipientEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("MedPlatform - Suspension temporaire de votre compte");
            message.setText("Bonjour,\n\n" +
                    "Nous vous informons que votre compte MedPlatform (Identifiant : " + username + ") a été temporairement suspendu par l'administration médicale.\n\n" +
                    "Vos accès à la plateforme sont bloqués jusqu'à nouvel ordre. Si vous pensez qu'il s'agit d'une erreur, merci de contacter l'administrateur de votre établissement.\n\n" +
                    "Cordialement,\nL'équipe de l'administration médicale.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email suspension : " + e.getMessage());
        }
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUuid(user.getUuid());
        dto.setLoginU(user.getLoginU());
        dto.setEmailU(user.getEmailU());
        dto.setActive(user.isActive()); 
        
        if (user.getRole() != null) {
            dto.setRoleU(user.getRole().getNomRole());
        }
        
        dto.setAccountNonLocked(user.isAccountNonLocked());
        dto.setLastlogin(user.getLastlogin());
        
        if(user.getService() != null){
            dto.setServiceId(user.getService().getIdentifiantS());
        }
        if(user.getMedecin() != null){
            dto.setMedecinId(user.getMedecin().getIdentifiantM());
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByUuid(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        return mapToResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public void registerFailedAttempt(String loginU) {
        userRepository.findByLoginU(loginU).ifPresent(user -> {
            int newAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newAttempts);
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                lockUser(user);
            }
            userRepository.save(user);
        });
    }

    @Override
    public void resetFailedAttempts(String loginU) {
        userRepository.findByLoginU(loginU).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setLocktime(null);
            userRepository.save(user);
        });
    }

    @Override
    public void lockUser(User user) {
        user.setAccountNonLocked(false);
        user.setLocktime(LocalDateTime.now(ZoneId.of("Africa/Tunis")));
        
        auditLogService.log(user.getLoginU(), "ROLE_USER", "VERROUILLAGE_COMPTE", 
                "Compte: " + user.getLoginU(), "Sécurité : Compte verrouillé suite à 5 échecs de connexion.");
    }
}