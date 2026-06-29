package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.User;
import com.pfa.medical_backend.repositories.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if (user.getRole() != null){
            authorities.add(new SimpleGrantedAuthority(user.getRole().getNomRole()));

            user.getRole().getPermissions().forEach(permission -> { 
                authorities.add(new SimpleGrantedAuthority(permission.getNomPermission()));
            });
        }

        // Construction de l'objet UserDetails de Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getLoginU())
                .password(user.getMotPasseU())
                .authorities(authorities)
                .accountLocked(!user.isAccountNonLocked())
                .disabled(false) 
                .accountExpired(false)
                .credentialsExpired(false)
                .build();
    }
}