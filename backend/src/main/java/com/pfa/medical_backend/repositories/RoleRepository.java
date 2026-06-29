package com.pfa.medical_backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pfa.medical_backend.entities.Role;


public interface RoleRepository extends JpaRepository<Role, Integer>{
    Optional<Role> findByNomRole(String nomRole);

    
}
