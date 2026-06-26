package com.pfa.medical_backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pfa.medical_backend.dto.UserRequestDTO;
import com.pfa.medical_backend.dto.UserResponseDTO;
import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Service 
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    public UserServiceImpl(UserRepository userRepository,PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
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

        // chiff sym de mdp
        user.setMotPasseU(passwordEncoder.encode(dto.getMotPasseU()));

        user.setRoleU(dto.getRoleU());
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);

        User savedUser = userRepository.save(user);


        return mapToResponseDTO(savedUser);
        
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUuid(user.getUuid());
        dto.setLoginU(user.getLoginU());
        dto.setRoleU(user.getRoleU());
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
                .collect(Collectors.toList());
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
