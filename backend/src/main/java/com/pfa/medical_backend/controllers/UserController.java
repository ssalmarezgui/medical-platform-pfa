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

    // Seul l'ADMIN technique peut créer des comptes utilisateurs
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO response = userService.createUser(userRequestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Seul l'ADMIN peut lister l'ensemble des comptes de la plateforme
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Un utilisateur authentifié peut consulter son propre profil ou un profil ciblé selon les règles RBAC
    @GetMapping("/{uuid}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDECIN_INVESTIGATEUR', 'ROLE_MEDECIN_SUIVI')")
    public ResponseEntity<UserResponseDTO> getUserByUuid(@PathVariable String uuid) {
        UserResponseDTO user = userService.getUserByUuid(uuid);
        return ResponseEntity.ok(user);
    }
}