package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AuditLogResponseDTO;
import com.pfa.medical_backend.entities.AuditLog;
import com.pfa.medical_backend.repositories.AuditLogRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void log_ShouldSaveAuditLog() {
        auditLogService.log("john_doe", "ROLE_ADMIN", "LOGIN", "AUTH", "Connexion réussie");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("john_doe", saved.getUsername());
        assertEquals("ROLE_ADMIN", saved.getRole());
        assertEquals("LOGIN", saved.getAction());
        assertEquals("AUTH", saved.getTarget());
        assertEquals("Connexion réussie", saved.getDetails());
        assertNotNull(saved.getTimestamp());
    }

    @Test
    void logAuto_WithUserDetailsPrincipal() {
        UserDetails userDetails = new User("dr_smith", "password", List.of(new SimpleGrantedAuthority("ROLE_MEDECIN")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        auditLogService.logAuto("EXPORT_PDF", "PATIENT", "Export effectué");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("dr_smith", saved.getUsername());
        assertEquals("ROLE_MEDECIN", saved.getRole());
    }

    @Test
    void logAuto_WithStringPrincipal() {
        Authentication auth = new UsernamePasswordAuthenticationToken("anonymous_str", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        auditLogService.logAuto("VISIT", "HOME", "Visite page d'accueil");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("anonymous_str", saved.getUsername());
    }

    @Test
    void logAuto_WithoutAuthentication_ShouldFallbackToSystem() {
        SecurityContextHolder.clearContext();

        auditLogService.logAuto("CRON_JOB", "DATABASE", "Nettoyage quotidien");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("SYSTEM", saved.getUsername());
        assertEquals("SYSTEM", saved.getRole());
    }

    @Test
    void getAllLogs_ShouldReturnMappedDTOList() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        log.setUsername("user1");
        log.setRole("ROLE_USER");
        log.setAction("UPDATE");
        log.setTarget("DOSSIER");
        log.setDetails("Mise à jour");
        log.setTimestamp(LocalDateTime.now());

        when(auditLogRepository.findAllByOrderByTimestampDesc()).thenReturn(List.of(log));

        List<AuditLogResponseDTO> logs = auditLogService.getAllLogs();

        assertEquals(1, logs.size());
        assertEquals("user1", logs.get(0).getUsername());
        assertEquals("UPDATE", logs.get(0).getAction());
    }
}