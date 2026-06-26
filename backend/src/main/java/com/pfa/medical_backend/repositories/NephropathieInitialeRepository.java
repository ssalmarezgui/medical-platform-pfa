package com.pfa.medical_backend.repositories;

import com.pfa.medical_backend.entities.NephropathieInitiale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NephropathieInitialeRepository extends JpaRepository<NephropathieInitiale, Integer> {
    
    // Récupérer les pathologies d'un patient spécifique (via son ID String)
    List<NephropathieInitiale> findByPatient_IdentifiantP(String patientId);

    // --- REQUÊTES DE SUPPRESSION NATIVES SÉCURISÉES ---
    @Modifying
    @Transactional("transactionManager")
    @Query(value = "DELETE FROM bilan_pre_greffe WHERE IdentifiantNI = :niId", nativeQuery = true)
    void deleteBilansByNiId(@Param("niId") Integer niId);

    @Modifying
    @Transactional("transactionManager")
    @Query(value = "DELETE FROM dialyse WHERE IdentifiantNI = :niId", nativeQuery = true)
    void deleteDialysesByNiId(@Param("niId") Integer niId);

    @Modifying
    @Transactional("transactionManager")
    @Query(value = "DELETE FROM parametres_biopsiques WHERE IdentifiantNI = :niId", nativeQuery = true)
    void deleteBiopsiesByNiId(@Param("niId") Integer niId);
}