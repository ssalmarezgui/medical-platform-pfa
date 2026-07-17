package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AuditLogResponseDTO;
import java.util.List;

public interface AuditLogService {
    void log(String username, String role, String action, String target, String details);

    void logAuto(String action, String target, String details);

    List<AuditLogResponseDTO> getAllLogs();
}