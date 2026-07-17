package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO response = userService.createUser(userRequestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getPendingUsers() {
        List<UserResponseDTO> pendingUsers = userService.getPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    @PutMapping("/{uuid}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponseDTO> approveUser(@PathVariable String uuid) {
        UserResponseDTO approvedUser = userService.approveUser(uuid);
        return ResponseEntity.ok(approvedUser);
    }

    @PutMapping("/{uuid}/toggle-status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponseDTO> toggleUserStatus(@PathVariable String uuid) {
        UserResponseDTO updatedUser = userService.toggleUserStatus(uuid);
        return ResponseEntity.ok(updatedUser);
    }
    @GetMapping("/{uuid}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDECIN_INVESTIGATEUR', 'ROLE_MEDECIN_SUIVI')")
    public ResponseEntity<UserResponseDTO> getUserByUuid(@PathVariable String uuid) {
        UserResponseDTO user = userService.getUserByUuid(uuid);
        return ResponseEntity.ok(user);
    }
}