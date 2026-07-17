package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.AdminDashboardDTO;
import com.pfa.medical_backend.services.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        AdminDashboardDTO stats = adminDashboardService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }
}