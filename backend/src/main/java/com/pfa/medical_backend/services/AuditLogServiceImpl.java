package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AuditLogResponseDTO;
import com.pfa.medical_backend.entities.AuditLog;
import com.pfa.medical_backend.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;


    @Override
    public void log(String username, String role, String action, String target, String details) {
        AuditLog logObj = new AuditLog();
        logObj.setTimestamp(LocalDateTime.now(ZoneId.of("Africa/Tunis")));
        logObj.setUsername(username);
        logObj.setRole(role);
        logObj.setAction(action);
        logObj.setTarget(target);
        logObj.setDetails(details);
        auditLogRepository.save(logObj);
    }

    @Override
    public void logAuto(String action, String target, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = "SYSTEM";
        String role = "SYSTEM";

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails userDetails) {
                username = userDetails.getUsername();
                role = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(auth -> auth.startsWith("ROLE_"))
                        .findFirst()
                        .orElse("ROLE_USER");
            } else if (principal instanceof String stringPrincipal) {
                username = stringPrincipal;
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

    private AuditLogResponseDTO mapToResponseDTO(AuditLog logObj) {
        AuditLogResponseDTO dto = new AuditLogResponseDTO();
        dto.setId(logObj.getId());
        dto.setTimestamp(logObj.getTimestamp());
        dto.setUsername(logObj.getUsername());
        dto.setRole(logObj.getRole());
        dto.setAction(logObj.getAction());
        dto.setTarget(logObj.getTarget());
        dto.setDetails(logObj.getDetails());
        return dto;
    }
}