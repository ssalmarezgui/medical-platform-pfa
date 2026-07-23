package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.LoginRequest;
import com.pfa.medical_backend.dto.LoginResponse;
import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.security.JwtUtils;
import com.pfa.medical_backend.services.AuditLogService;
import com.pfa.medical_backend.services.OtpService;
import com.pfa.medical_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private static final String MSG_KEY = "message";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String ACTION_RESET_MDP = "Récupération Mot de passe";

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender mailSender;
    private final AuditLogService auditLogService;


    @PostMapping("/login-step1")
    public ResponseEntity<Object> loginStep1(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByLoginU(loginRequest.getLoginU());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MSG_KEY, "Identifiant ou mot de passe incorrect."));
        }

        User user = userOpt.get();

        if (!user.isAccountNonLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(MSG_KEY, "Compte verrouillé suite à plusieurs tentatives infructueuses."));
        }

        if (!passwordEncoder.matches(loginRequest.getMotPasseU(), user.getMotPasseU())) {
            userService.registerFailedAttempt(user.getLoginU());
            
            auditLogService.log(loginRequest.getLoginU(), ROLE_USER, "CONNEXION_ECHEC", 
                    "Authentification Étape 1", "Saisie de mot de passe incorrect.");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MSG_KEY, "Identifiant ou mot de passe incorrect."));
        }

        userService.resetFailedAttempts(user.getLoginU());

        if (!user.isActive()) {
            auditLogService.log(user.getLoginU(), ROLE_USER, "CONNEXION_BLOQUEE", 
                    "Compte non validé", "Tentative de connexion refusée : compte en attente de validation.");

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(MSG_KEY, "Votre compte est en attente de validation par l'administration médicale."));
        }

        String roleName = user.getRole() != null ? user.getRole().getNomRole() : ROLE_USER;

        if (user.getEmailU() != null && !user.getEmailU().isBlank()) {
            String recipientEmail = user.getEmailU();
            
            String otpCode = otpService.generateOtp(user.getLoginU());

            sendOtpEmail(recipientEmail, otpCode);

            String maskedEmail = maskEmail(recipientEmail);

            auditLogService.log(user.getLoginU(), roleName, "DEMANDE_OTP", 
                    "Authentification Étape 1", "Identifiants corrects. Code OTP envoyé par email à " + maskedEmail);

            return ResponseEntity.ok(Map.of(
                "requiresOtp", true,
                "maskedEmail", maskedEmail
            ));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getLoginU(), loginRequest.getMotPasseU())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String role = getRoleFromUserDetails(userDetails);
        List<String> authorities = getAuthoritiesFromUserDetails(userDetails);

        auditLogService.log(user.getLoginU(), role, "CONNEXION_REUSSITE", 
                "Connexion Directe", "Session ouverte directement (sans OTP).");

        return ResponseEntity.ok(Map.of(
            "requiresOtp", false,
            "authResponse", new LoginResponse(jwt, userDetails.getUsername(), role, authorities)
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Object> verifyOtp(@RequestBody Map<String, String> request) {
        String loginU = request.get("loginU");
        String otpCode = request.get("otpCode");

        if (loginU == null || otpCode == null) {
            return ResponseEntity.badRequest().body(Map.of(MSG_KEY, "Paramètres manquants."));
        }

        boolean isOtpValid = otpService.validateOtp(loginU, otpCode);
        if (!isOtpValid) {
            auditLogService.log(loginU, ROLE_USER, "OTP_ECHEC", 
                    "Authentification Étape 2", "Code OTP saisi incorrect ou expiré.");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MSG_KEY, "Code de validation incorrect ou expiré."));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginU);
        
        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        String role = getRoleFromUserDetails(userDetails);
        List<String> authorities = getAuthoritiesFromUserDetails(userDetails);

        auditLogService.log(loginU, role, "CONNEXION_REUSSITE", 
                "Connexion Double-Facteur", "Code OTP validé. Session clinique sécurisée ouverte.");

        return ResponseEntity.ok(new LoginResponse(jwt, userDetails.getUsername(), role, authorities));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> request) {
        String emailU = request.get("emailU");

        if (emailU == null || emailU.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(MSG_KEY, "L'adresse email est requise."));
        }

        Optional<User> userOpt = userRepository.findByEmailU(emailU);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(MSG_KEY, "Aucun compte clinique n'est associé à cette adresse email."));
        }

        User user = userOpt.get();
        String otpCode = otpService.generateOtp(user.getLoginU());

        sendForgotPasswordEmail(user.getEmailU(), otpCode);

        auditLogService.log(user.getLoginU(), user.getRole() != null ? user.getRole().getNomRole() : ROLE_USER, 
                "DEMANDE_REINITIALISATION_MDP", ACTION_RESET_MDP, "Code de réinitialisation envoyé par email.");

        return ResponseEntity.ok(Map.of(MSG_KEY, "Un code de réinitialisation a été envoyé à votre adresse email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody Map<String, String> request) {
        String emailU = request.get("emailU");
        String otpCode = request.get("otpCode");
        String newPassword = request.get("newPassword");

        if (emailU == null || otpCode == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(MSG_KEY, "Données invalides ou mot de passe trop court."));
        }

        Optional<User> userOpt = userRepository.findByEmailU(emailU);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(MSG_KEY, "Utilisateur introuvable."));
        }
        User user = userOpt.get();

        boolean isOtpValid = otpService.validateOtp(user.getLoginU(), otpCode);
        if (!isOtpValid) {
            auditLogService.log(user.getLoginU(), user.getRole() != null ? user.getRole().getNomRole() : ROLE_USER, 
                    "REINITIALISATION_MDP_ECHEC", ACTION_RESET_MDP, "Saisie de code de réinitialisation invalide.");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(MSG_KEY, "Code de réinitialisation incorrect ou expiré."));
        }

        user.setMotPasseU(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogService.log(user.getLoginU(), user.getRole() != null ? user.getRole().getNomRole() : ROLE_USER, 
                "REINITIALISATION_MDP_SUCCES", ACTION_RESET_MDP, "Mot de passe réinitialisé avec succès.");

        return ResponseEntity.ok(Map.of(MSG_KEY, "Votre mot de passe a été réinitialisé avec succès."));
    }

    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        try {
            UserResponseDTO response = userService.createUser(userRequestDTO);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(MSG_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(MSG_KEY, "Erreur d'inscription."));
        }
    }

    private void sendOtpEmail(String recipientEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("NephroCare - Votre code de sécurité");
            message.setText("Bonjour,\n\n" +
                    "Voici votre code de sécurité pour la double authentification : " + otpCode + "\n" +
                    "Ce code est valide pendant 5 minutes.\n\n" +
                    "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.\n\n" +
                    "Cordialement,\nL'équipe de l'administration médicale.");
            
            mailSender.send(message);
            log.info("[EMAIL SYSTEM] Code de double authentification envoyé à : {}", recipientEmail);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'OTP par email : ", e);
        }
    }

    private void sendForgotPasswordEmail(String recipientEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("NephroCare - Réinitialisation de votre mot de passe");
            message.setText("Bonjour,\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe NephroCare.\n" +
                    "Voici votre code de sécurité temporaire : " + otpCode + "\n" +
                    "Ce code est valide pendant 5 minutes.\n\n" +
                    "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" +
                    "Cordialement,\nL'équipe administrative.");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Erreur envoi email réinitialisation : ", e);
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "votre adresse email";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.substring(0, 1) + "***@" + domain;
        }
        return name.substring(0, 1) + "***" + name.substring(name.length() - 1) + "@" + domain;
    }

    private String getRoleFromUserDetails(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .findFirst()
                .orElse(ROLE_USER);
    }

    private List<String> getAuthoritiesFromUserDetails(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }
}