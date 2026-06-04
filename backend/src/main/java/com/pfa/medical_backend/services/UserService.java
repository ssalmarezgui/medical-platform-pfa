package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.*;

import com.pfa.medical_backend.repositories.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{12,}$"
    );

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
            );
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    @Transactional("transactionManager")
    public User createUser(User user, Integer serviceId, Integer medecinId) {
        if (user.getMotPasseU() != null && !user.getMotPasseU().isBlank()) {
            validatePassword(user.getMotPasseU());
            user.setMotPasseU(passwordEncoder.encode(user.getMotPasseU()));
        }
        if (serviceId != null) {
            serviceRepository.findById(serviceId).ifPresent(user::setService);
        }
        if (medecinId != null) {
            user.setMedecin(medecinRepository.findById(medecinId)
                    .orElseThrow(() -> new RuntimeException("Medecin non trouve")));
        } else {
            user.setMedecin(null);
        }
        return userRepository.save(user);
    }

    @Transactional("transactionManager")
    public User updateUser(Integer id, User userDetails, Integer serviceId, Integer medecinId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        if (userDetails.getLoginU() != null) user.setLoginU(userDetails.getLoginU());
        if (userDetails.getMotPasseU() != null && !userDetails.getMotPasseU().isBlank()) {
            validatePassword(userDetails.getMotPasseU());
            user.setMotPasseU(passwordEncoder.encode(userDetails.getMotPasseU()));
        }
        if (userDetails.getRoleU() != null) user.setRoleU(userDetails.getRoleU());

        if (serviceId != null) {
            Optional<ServiceMedical> service = serviceRepository.findById(serviceId);
            service.ifPresent(user::setService);
        }

        if (medecinId != null) {
            user.setMedecin(medecinRepository.findById(medecinId)
                    .orElseThrow(() -> new RuntimeException("Medecin non trouve")));
        } else {
            user.setMedecin(null);
        }

        return userRepository.save(user);
    }

    @Transactional("transactionManager")
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}

