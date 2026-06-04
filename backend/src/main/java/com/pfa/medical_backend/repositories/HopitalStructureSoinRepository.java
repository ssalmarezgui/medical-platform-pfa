

package com.pfa.medical_backend.repositories;
import com.pfa.medical_backend.entities.HopitalStructureSoin;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;




@Repository
public interface HopitalStructureSoinRepository extends JpaRepository<HopitalStructureSoin, String> {

    List<HopitalStructureSoin> findByLibelleHContainingIgnoreCase(String libelle);

    List<HopitalStructureSoin> findByNbServiceHGreaterThanEqual(Integer nbServices);

    List<HopitalStructureSoin> findByNbLitsHGreaterThanEqual(Integer nbLits);
}
