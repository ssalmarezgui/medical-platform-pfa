package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    Optional<Permission> findByNomPermission(String nomPermission);
}