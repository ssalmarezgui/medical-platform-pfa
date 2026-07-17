package com.pfa.medical_backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class AuditLogResponseDTO {
    private Long id;
    private LocalDateTime timestamp;
    private String username;
    private String role;
    private String action;
    private String target;
    private String details;
}