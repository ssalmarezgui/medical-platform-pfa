package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AuditLogResponseDTO;
import com.pfa.medical_backend.services.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogs() {
        List<AuditLogResponseDTO> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
}