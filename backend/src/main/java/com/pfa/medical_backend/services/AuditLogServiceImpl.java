package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AuditLogResponseDTO;
import com.pfa.medical_backend.entities.AuditLog;
import com.pfa.medical_backend.repositories.AuditLogRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void log(String username, String role, String action, String target, String details) {
        AuditLog log = new AuditLog();
        log.setTimestamp(LocalDateTime.now(ZoneId.of("Africa/Tunis")));
        log.setUsername(username);
        log.setRole(role);
        log.setAction(action);
        log.setTarget(target);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    @Override
    public void logAuto(String action, String target, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = "SYSTEM";
        String role = "SYSTEM";

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
                role = authentication.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .filter(auth -> auth.startsWith("ROLE_"))
                        .findFirst()
                        .orElse("ROLE_USER");
            } else if (principal instanceof String) {
                username = (String) principal;
            }
        }

        log(username, role, action, target, details);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private AuditLogResponseDTO mapToResponseDTO(AuditLog log) {
        AuditLogResponseDTO dto = new AuditLogResponseDTO();
        dto.setId(log.getId());
        dto.setTimestamp(log.getTimestamp());
        dto.setUsername(log.getUsername());
        dto.setRole(log.getRole());
        dto.setAction(log.getAction());
        dto.setTarget(log.getTarget());
        dto.setDetails(log.getDetails());
        return dto;
    }
}