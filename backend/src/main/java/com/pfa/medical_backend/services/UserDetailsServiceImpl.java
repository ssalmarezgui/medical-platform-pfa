package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByLoginU(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le login : " + username));

        // Ajout du préfixe ROLE_ requis par Spring Security si non présent dans la base
        String roleWithPrefix = user.getRoleU().startsWith("ROLE_") ? user.getRoleU() : "ROLE_" + user.getRoleU();
        // SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleWithPrefix);
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRoleU());

        // Construction de l'objet UserDetails de Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getLoginU())
                .password(user.getMotPasseU())
                .authorities(Collections.singletonList(authority))
                // Liaison avec logique force brute
                .accountLocked(!user.isAccountNonLocked())
                // Autres propriétés par défaut (ajustables aux futurs)
                .disabled(false) 
                .accountExpired(false)
                .credentialsExpired(false)
                .build();
    }
}