package com.pfa.medical_backend.controllers;

import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    private static final Set<String> ALLOWED_ROLES = Set.of(
        "ADMIN", "MEDECIN_INVESTIGATEUR", "MEDECIN_SUIVI", 
        "AGENT_LABORATOIRE", "AGENT_IMMUNO"
    );

    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> create(
            @RequestBody User user,
            @RequestParam(required = false) Integer serviceId,
            @RequestParam(required = false) Integer medecinId) {
        
        validateRole(user.getRoleU());
        log.info("Création de l'utilisateur : {}", user.getLoginU());
        
        return new ResponseEntity<>(
            userService.createUser(user, serviceId, medecinId), 
            HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public User update(
            @PathVariable Integer id,
            @RequestBody User userDetails,
            @RequestParam(required = false) Integer serviceId,
            @RequestParam(required = false) Integer medecinId) {
        
        if (userDetails.getRoleU() != null) {
            validateRole(userDetails.getRoleU());
        }
        
        return userService.updateUser(id, userDetails, serviceId, medecinId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.warn("Suppression de l'utilisateur ID : {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private void validateRole(String role) {
        if (role == null || !ALLOWED_ROLES.contains(role)) {
            throw new IllegalArgumentException("Rôle non reconnu par le système médical.");
        }
    }
}