package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.entities.Role;
import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.repositories.RoleRepository;
import com.pfa.medical_backend.repositories.MedecinRepository;
import com.pfa.medical_backend.repositories.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private MedecinRepository medecinRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRequestDTO userRequestDTO;
    private Role role;
    private User user;
    private ServiceMedical serviceMedical;

    @BeforeEach
    void setUp() {
        userRequestDTO = new UserRequestDTO();
        userRequestDTO.setLoginU("dr_salma");
        userRequestDTO.setMotPasseU("password123");
        userRequestDTO.setEmailU("salma.rezgui@ensi-uma.tn");
        userRequestDTO.setRoleU("ROLE_MEDECIN_SUIVI");
        userRequestDTO.setServiceId(1);

        role = new Role();
        role.setNomRole("ROLE_MEDECIN_SUIVI");

        serviceMedical = new ServiceMedical();
        serviceMedical.setIdentifiantS(1);

        user = new User();
        user.setLoginU("dr_salma");
        user.setEmailU("salma.rezgui@ensi-uma.tn");
        user.setRole(role);
        user.setService(serviceMedical);
        user.setActive(false);
    }

    @Test
    void testCreateUser_Success() {
        when(userRepository.existsByLoginU(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(roleRepository.findByNomRole(anyString())).thenReturn(Optional.of(role));
        when(serviceRepository.findById(anyInt())).thenReturn(Optional.of(serviceMedical));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponseDTO response = userService.createUser(userRequestDTO);

        assertNotNull(response);
        assertEquals("dr_salma", response.getLoginU());
        assertEquals("salma.rezgui@ensi-uma.tn", response.getEmailU());
        assertFalse(response.isActive());

        verify(userRepository, times(1)).save(any(User.class));
        verify(auditLogService, times(1)).log(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testCreateUser_DuplicateLogin_ThrowsException() {
        when(userRepository.existsByLoginU("dr_salma")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(userRequestDTO);
        });

        assertEquals("Ce login est déjà utilisé", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testApproveUser_Success() {
        when(userRepository.findByUuid("test-uuid")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDTO response = userService.approveUser("test-uuid");

        assertTrue(response.isActive());
        verify(auditLogService, times(1)).logAuto(eq("VALIDATION_COMPTE"), anyString(), anyString());
    }
}