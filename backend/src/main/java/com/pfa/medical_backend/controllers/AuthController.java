package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.LoginRequest;
import com.pfa.medical_backend.dto.LoginResponse;
import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.security.JwtUtils;
import com.pfa.medical_backend.services.OtpService;
import com.pfa.medical_backend.services.UserService;
import jakarta.validation.Valid;
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
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender mailSender;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, 
                          UserService userService, UserRepository userRepository, 
                          PasswordEncoder passwordEncoder, OtpService otpService,
                          UserDetailsService userDetailsService, JavaMailSender mailSender) { 
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.userDetailsService = userDetailsService;
        this.mailSender = mailSender; 
    }

    @PostMapping("/login-step1")
    public ResponseEntity<Object> loginStep1(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByLoginU(loginRequest.getLoginU());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiant ou mot de passe incorrect."));
        }

        User user = userOpt.get();

        if (!user.isAccountNonLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Compte verrouillé suite à plusieurs tentatives infructueuses."));
        }

        if (!passwordEncoder.matches(loginRequest.getMotPasseU(), user.getMotPasseU())) {
            userService.registerFailedAttempt(user.getLoginU());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiant ou mot de passe incorrect."));
        }

        userService.resetFailedAttempts(user.getLoginU());

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Votre compte est en attente de validation par l'administration médicale."));
        }
        if (user.getEmailU() != null && !user.getEmailU().isBlank()) {
            String recipientEmail = user.getEmailU();
            
            String otpCode = otpService.generateOtp(user.getLoginU());

            sendOtpEmail(recipientEmail, otpCode);

            String maskedEmail = maskEmail(recipientEmail);

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
            return ResponseEntity.badRequest().body(Map.of("message", "Paramètres manquants."));
        }

        boolean isOtpValid = otpService.validateOtp(loginU, otpCode);
        if (!isOtpValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Code de validation incorrect ou expiré."));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginU);
        
        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        String role = getRoleFromUserDetails(userDetails);
        List<String> authorities = getAuthoritiesFromUserDetails(userDetails);

        return ResponseEntity.ok(new LoginResponse(jwt, userDetails.getUsername(), role, authorities));
    }

    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        try {
            UserResponseDTO response = userService.createUser(userRequestDTO);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur d'inscription."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> request) {
        String emailU = request.get("emailU");

        if (emailU == null || emailU.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "L'adresse email est requise."));
        }
        Optional<User> userOpt = userRepository.findByEmailU(emailU);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Aucun compte clinique n'est associé à cette adresse email."));
        }

        User user = userOpt.get();

        String otpCode = otpService.generateOtp(user.getLoginU());

        sendForgotPasswordEmail(user.getEmailU(), otpCode);

        return ResponseEntity.ok(Map.of("message", "Un code de réinitialisation a été envoyé à votre adresse email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody Map<String, String> request) {
        String emailU = request.get("emailU");
        String otpCode = request.get("otpCode");
        String newPassword = request.get("newPassword");

        if (emailU == null || otpCode == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Données invalides ou mot de passe trop court (min 8 caractères)."));
        }

        Optional<User> userOpt = userRepository.findByEmailU(emailU);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur introuvable."));
        }
        User user = userOpt.get();

        boolean isOtpValid = otpService.validateOtp(user.getLoginU(), otpCode);
        if (!isOtpValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Code de réinitialisation incorrect ou expiré."));
        }

        user.setMotPasseU(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Votre mot de passe a été réinitialisé avec succès."));
    }

    private void sendForgotPasswordEmail(String recipientEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("MedPlatform - Réinitialisation de votre mot de passe");
            message.setText("Bonjour,\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe MedPlatform.\n" +
                    "Voici votre code de sécurité temporaire : " + otpCode + "\n" +
                    "Ce code est valide pendant 5 minutes.\n\n" +
                    "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et sécuriser votre compte.\n\n" +
                    "Cordialement,\nL'équipe administrative.");
            mailSender.send(message);
            System.out.println("[EMAIL SYSTEM] Code de réinitialisation envoyé à : " + recipientEmail);
        } catch (Exception e) {
            System.err.println("Erreur envoi email réinitialisation : " + e.getMessage());
        }
    }



    private void sendOtpEmail(String recipientEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ssalmarezgui@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject("MedPlatform - Votre code de sécurité");
            message.setText("Bonjour,\n\n" +
                    "Voici votre code de sécurité pour la double authentification : " + otpCode + "\n" +
                    "Ce code est valide pendant 5 minutes.\n\n" +
                    "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.\n\n" +
                    "Cordialement,\nL'équipe de l'administration médicale.");
            
            mailSender.send(message);
            System.out.println("[EMAIL SYSTEM] Code de double authentification envoyé à : " + recipientEmail);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'OTP par email : " + e.getMessage());
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
                .orElse("ROLE_USER");
    }

    private List<String> getAuthoritiesFromUserDetails(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }
}