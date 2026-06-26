package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.ServiceMedical;
import com.pfa.medical_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByLoginU(String loginU);
    Optional<User> findByUuid(String uuid);

    Boolean existsByLoginU(String loginU);

    List<User> findByRoleUIgnoreCase(String roleU);

    List<User> findByService(ServiceMedical service);

    @Query("SELECT DISTINCT u FROM User u JOIN u.service s JOIN s.hopital h WHERE h.identifiantH = :hopitalId")
    List<User> findByHopitalId(@Param("hopitalId") Integer hopitalId);

    List<User> findByLoginUContainingIgnoreCase(String loginU);
}