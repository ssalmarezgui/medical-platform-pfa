package com.pfa.medical_backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfa.medical_backend.dto.LoginRequest;
import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.Role;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.security.JwtUtils;
import com.pfa.medical_backend.services.AuditLogService;
import com.pfa.medical_backend.services.OtpService;
import com.pfa.medical_backend.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private UserService userService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private OtpService otpService;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private JavaMailSender mailSender;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        Role role = new Role();
        role.setNomRole("ROLE_ADMIN");

        sampleUser = new User();
        sampleUser.setLoginU("john_doe");
        sampleUser.setMotPasseU("encodedPassword");
        sampleUser.setEmailU("john.doe@example.com");
        sampleUser.setActive(true);
        sampleUser.setAccountNonLocked(true);
        sampleUser.setRole(role);
    }

    // Méthode utilitaire pour créer la requête sans dépendre des constructeurs
    private LoginRequest createLoginRequest(String login, String password) {
        LoginRequest req = new LoginRequest();
        req.setLoginU(login);
        req.setMotPasseU(password);
        return req;
    }

    // ==========================================
    // LOGIN STEP 1
    // ==========================================

    @Test
    void loginStep1_UserNotFound_ShouldReturn401() throws Exception {
        LoginRequest req = createLoginRequest("unknown", "password");
        when(userRepository.findByLoginU("unknown")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Identifiant ou mot de passe incorrect."));
    }

    @Test
    void loginStep1_AccountLocked_ShouldReturn403() throws Exception {
        sampleUser.setAccountNonLocked(false);
        LoginRequest req = createLoginRequest("john_doe", "password");
        when(userRepository.findByLoginU("john_doe")).thenReturn(Optional.of(sampleUser));

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Compte verrouillé suite à plusieurs tentatives infructueuses."));
    }

    @Test
    void loginStep1_WrongPassword_ShouldReturn401() throws Exception {
        LoginRequest req = createLoginRequest("john_doe", "wrongPassword");
        when(userRepository.findByLoginU("john_doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());

        verify(userService).registerFailedAttempt("john_doe");
    }

    @Test
    void loginStep1_UserNotActive_ShouldReturn403() throws Exception {
        sampleUser.setActive(false);
        LoginRequest req = createLoginRequest("john_doe", "password");
        when(userRepository.findByLoginU("john_doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Votre compte est en attente de validation par l'administration médicale."));
    }

    @Test
    void loginStep1_Success_WithOtpEmail() throws Exception {
        LoginRequest req = createLoginRequest("john_doe", "password");
        when(userRepository.findByLoginU("john_doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(otpService.generateOtp("john_doe")).thenReturn("123456");

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresOtp").value(true))
                .andExpect(jsonPath("$.maskedEmail").exists());

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void loginStep1_Success_WithoutEmail_DirectLogin() throws Exception {
        sampleUser.setEmailU(null); // Pas d'email -> connexion directe
        LoginRequest req = createLoginRequest("john_doe", "password");

        when(userRepository.findByLoginU("john_doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);

        Authentication auth = mock(Authentication.class);
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "john_doe", "encodedPassword", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("dummy-jwt-token");
        when(auth.getPrincipal()).thenReturn(userDetails);

        mockMvc.perform(post("/api/v1/auth/login-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresOtp").value(false))
                .andExpect(jsonPath("$.authResponse.token").value("dummy-jwt-token"));
    }

    // ==========================================
    // VERIFY OTP
    // ==========================================

    @Test
    void verifyOtp_MissingParams_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("loginU", "john_doe"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void verifyOtp_InvalidOtp_ShouldReturn401() throws Exception {
        when(otpService.validateOtp("john_doe", "000000")).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("loginU", "john_doe", "otpCode", "000000"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyOtp_Success() throws Exception {
        when(otpService.validateOtp("john_doe", "123456")).thenReturn(true);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "john_doe", "encodedPassword", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        when(userDetailsService.loadUserByUsername("john_doe")).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(any())).thenReturn("valid-jwt-token");

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("loginU", "john_doe", "otpCode", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("valid-jwt-token"));
    }

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    @Test
    void forgotPassword_BlankEmail_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("emailU", ""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forgotPassword_EmailNotFound_ShouldReturn404() throws Exception {
        when(userRepository.findByEmailU("unknown@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("emailU", "unknown@test.com"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void forgotPassword_Success() throws Exception {
        when(userRepository.findByEmailU("john.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(otpService.generateOtp("john_doe")).thenReturn("654321");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("emailU", "john.doe@example.com"))))
                .andExpect(status().isOk());

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    @Test
    void resetPassword_ShortPassword_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "emailU", "john.doe@example.com",
                                "otpCode", "123456",
                                "newPassword", "123"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPassword_UserNotFound_ShouldReturn404() throws Exception {
        when(userRepository.findByEmailU("unknown@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "emailU", "unknown@test.com",
                                "otpCode", "123456",
                                "newPassword", "ValidPassword123"
                        ))))
                .andExpect(status().isNotFound());
    }

    @Test
    void resetPassword_InvalidOtp_ShouldReturn401() throws Exception {
        when(userRepository.findByEmailU("john.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(otpService.validateOtp("john_doe", "000000")).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "emailU", "john.doe@example.com",
                                "otpCode", "000000",
                                "newPassword", "ValidPassword123"
                        ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void resetPassword_Success() throws Exception {
        when(userRepository.findByEmailU("john.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(otpService.validateOtp("john_doe", "123456")).thenReturn(true);
        when(passwordEncoder.encode("ValidPassword123")).thenReturn("newHashedPassword");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "emailU", "john.doe@example.com",
                                "otpCode", "123456",
                                "newPassword", "ValidPassword123"
                        ))))
                .andExpect(status().isOk());

        verify(userRepository).save(sampleUser);
    }

    // ==========================================
    // REGISTER
    // ==========================================

    private UserRequestDTO createSampleUserRequestDTO() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setLoginU("nouveau_user");
        dto.setMotPasseU("Password123!");
        dto.setEmailU("new.user@example.com");
        return dto;
    }

    @Test
    void registerUser_Success() throws Exception {
        UserResponseDTO responseDTO = new UserResponseDTO();

        when(userService.createUser(any(UserRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createSampleUserRequestDTO())))
                .andExpect(status().isCreated());
    }

    @Test
    void registerUser_IllegalArgumentException_ShouldReturn400() throws Exception {
        when(userService.createUser(any())).thenThrow(new IllegalArgumentException("Login déjà utilisé."));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createSampleUserRequestDTO())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Login déjà utilisé."));
    }

    @Test
    void registerUser_GeneralException_ShouldReturn500() throws Exception {
        when(userService.createUser(any())).thenThrow(new RuntimeException("Erreur BDD"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createSampleUserRequestDTO())))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Erreur d'inscription."));
    }
}