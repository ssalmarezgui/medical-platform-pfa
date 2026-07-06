package com.pfa.medical_backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.entities.Role;
import com.pfa.medical_backend.entities.Medecin;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.repositories.RoleRepository;
import com.pfa.medical_backend.repositories.MedecinRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Service 
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, MedecinRepository medecinRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.medecinRepository = medecinRepository;
        this.passwordEncoder = passwordEncoder;
    }
    

    @Override
    public UserResponseDTO createUser(UserRequestDTO dto) {
        if(userRepository.existsByLoginU(dto.getLoginU())){
            throw new IllegalArgumentException("Ce login est déjà utilisé");
        }

        User user = new User();
        user.setUuid(UUID.randomUUID().toString());
        user.setLoginU(dto.getLoginU());
        user.setMotPasseU(passwordEncoder.encode(dto.getMotPasseU()));
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);

        if (dto.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new EntityNotFoundException("Matricule médecin invalide ou non enregistré par l'administration."));
            
            if (medecin.getUtilisateur() != null) {
                throw new IllegalArgumentException("Un compte de connexion est déjà enregistré pour ce matricule de médecin.");
            }

            user.setMedecin(medecin);
            user.setService(medecin.getService());

            String targetRoleName = "ROLE_MEDECIN_SUIVI";
            
            if (medecin.getTypeMedecin() != null) {
                switch (medecin.getTypeMedecin()) {
                    case SUIVI:
                        targetRoleName = "ROLE_MEDECIN_SUIVI";
                        break;
                    case INVESTIGATEUR:
                        targetRoleName = "ROLE_MEDECIN_INVESTIGATEUR";
                        break;
                }
            }

            final String finalTargetRoleName = targetRoleName;

            Role role = roleRepository.findByNomRole(finalTargetRoleName)
                .orElseThrow(() -> new EntityNotFoundException("Rôle de sécurité non configuré : " + finalTargetRoleName));
            
            user.setRole(role);
        } else {
            Role role = roleRepository.findByNomRole(dto.getRoleU())
                    .orElseThrow(() -> new EntityNotFoundException("Rôle introuvable : " + dto.getRoleU()));
            user.setRole(role);
        }

        User savedUser = userRepository.save(user);
        return mapToResponseDTO(savedUser);
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUuid(user.getUuid());
        dto.setLoginU(user.getLoginU());
        
        if (user.getRole() != null) {
            dto.setRoleU(user.getRole().getNomRole());
        }
        
        dto.setAccountNonLocked(user.isAccountNonLocked());
        dto.setLastlogin(user.getLastlogin());
        
        if(user.getService() != null){
            dto.setServiceId(user.getService().getIdentifiantS());
        }
        if(user.getMedecin() != null){
            dto.setMedecinId(user.getMedecin().getIdentifiantM());
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByUuid(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        return mapToResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    public void registerFailedAttempt(String loginU) {
        userRepository.findByLoginU(loginU).ifPresent(user -> {
            int newAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newAttempts);
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                lockUser(user);
            }
            userRepository.save(user);
        });
    }

    @Override
    public void resetFailedAttempts(String loginU) {
        userRepository.findByLoginU(loginU).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setLocktime(null);
            userRepository.save(user);
        });
    }

    @Override
    public void lockUser(User user) {
        user.setAccountNonLocked(false);
        user.setLocktime(LocalDateTime.now());
    }
}