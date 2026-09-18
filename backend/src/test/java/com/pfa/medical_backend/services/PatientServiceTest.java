package com.pfa.medical_backend.services;

import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.repositories.MedecinRepository;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import com.pfa.medical_backend.repositories.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientIdAdminRepository patientRepository;

    @Mock
    private MedecinRepository medecinRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private PatientService patientService;

    private PatientIdAdmin patientAdulte;
    private PatientIdAdmin patientMineur;

    @BeforeEach
    void setUp() {
        // Préparation d'un patient adulte standard
        patientAdulte = new PatientIdAdmin();
        patientAdulte.setNomP("Ben Ali");
        patientAdulte.setPrenomP("Mohamed");
        patientAdulte.setNumeroCin("01234567");
        patientAdulte.setNumCarnetP("98765432");
        patientAdulte.setDateNaissP(LocalDate.of(1985, 5, 20));
        patientAdulte.setIndexHopitalP("HCN_Tunis");
        patientAdulte.setAdulteP(true);

        // Préparation d'un patient pédiatrique (enfant)
        patientMineur = new PatientIdAdmin();
        patientMineur.setNomP("Trabelsi");
        patientMineur.setPrenomP("Youssef");
        patientMineur.setNumeroCin("09876543"); // CIN du tuteur
        patientMineur.setNumCarnetP("11223344");
        patientMineur.setDateNaissP(LocalDate.of(2015, 8, 12));
        patientMineur.setIndexHopitalP("HCN_Tunis");
        patientMineur.setAdulteP(false);
    }

    @Test
    @DisplayName("Test 1 : Création réussie d'un Adulte avec calcul correct de l'Identifiant (Suffixe A)")
    void testCreatePatient_Adulte_Succes() {
        // GIVEN (Aucun doublon en base, et premier patient de l'hôpital)
        when(patientRepository.findAll()).thenReturn(Collections.emptyList());
        when(patientRepository.findByIndexHopitalP("HCN_Tunis")).thenReturn(Collections.emptyList());
        when(patientRepository.save(any(PatientIdAdmin.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        PatientIdAdmin result = patientService.createPatient(patientAdulte);

        // THEN : Format attendu = HCN_4567_5432_A_001
        assertNotNull(result);
        assertEquals("HCN_4567_5432_A_001", result.getIdentifiantP());
        verify(patientRepository, times(2)).save(any(PatientIdAdmin.class));
    }

    @Test
    @DisplayName("Test 2 : Création réussie d'un Enfant avec calcul du Suffixe E et séquence incrémentale")
    void testCreatePatient_Mineur_Succes() {
        // GIVEN (2 patients existent déjà pour cet hôpital -> la séquence doit être 003)
        List<PatientIdAdmin> existants = List.of(new PatientIdAdmin(), new PatientIdAdmin());
        when(patientRepository.findAll()).thenReturn(Collections.emptyList());
        when(patientRepository.findByIndexHopitalP("HCN_Tunis")).thenReturn(existants);
        when(patientRepository.save(any(PatientIdAdmin.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        PatientIdAdmin result = patientService.createPatient(patientMineur);

        // THEN : Format attendu = HCN_6543_3344_E_003
        assertNotNull(result);
        assertEquals("HCN_6543_3344_E_003", result.getIdentifiantP());
    }

    @Test
    @DisplayName("Test 3 : Détection de Doublon Adulte (Même CIN + Même Date de Naissance) -> Exception attendue")
    void testCreatePatient_DoublonAdulte_DoitEchouer() {
        // GIVEN : Un patient avec le même CIN et même date de naissance existe déjà
        PatientIdAdmin doublonEnBase = new PatientIdAdmin();
        doublonEnBase.setIdentifiantP("HCN_4567_5432_A_001");
        doublonEnBase.setNumeroCin("01234567");
        doublonEnBase.setDateNaissP(LocalDate.of(1985, 5, 20));
        doublonEnBase.setAdulteP(true);

        when(patientRepository.findAll()).thenReturn(List.of(doublonEnBase));

        // WHEN & THEN : Doit lancer une IllegalArgumentException avec le préfixe DOUBLON_DETECTED
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            patientService.createPatient(patientAdulte);
        });

        assertTrue(exception.getMessage().contains("DOUBLON_DETECTED:HCN_4567_5432_A_001"));
        verify(patientRepository, never()).save(any(PatientIdAdmin.class));
    }

    @Test
    @DisplayName("Test 4 : Détection de Doublon Enfant (Même CIN parent + Même Date + Même Nom/Prénom) -> Exception")
    void testCreatePatient_DoublonEnfant_DoitEchouer() {
        // GIVEN : Un enfant identique existe déjà
        PatientIdAdmin enfantEnBase = new PatientIdAdmin();
        enfantEnBase.setIdentifiantP("HCN_6543_3344_E_002");
        enfantEnBase.setNumeroCin("09876543");
        enfantEnBase.setDateNaissP(LocalDate.of(2015, 8, 12));
        enfantEnBase.setNomP("trabelsi");
        enfantEnBase.setPrenomP("youssef");
        enfantEnBase.setAdulteP(false);

        when(patientRepository.findAll()).thenReturn(List.of(enfantEnBase));

        // WHEN & THEN
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            patientService.createPatient(patientMineur);
        });

        assertTrue(exception.getMessage().contains("DOUBLON_DETECTED:HCN_6543_3344_E_002"));
    }

    @Test
    @DisplayName("Test 5 : Échec si le CIN est manquant ou vide")
    void testCreatePatient_CinManquant_DoitEchouer() {
        patientAdulte.setNumeroCin("   "); // CIN vide

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            patientService.createPatient(patientAdulte);
        });

        assertEquals("Le numéro CIN ou CIN du parent est requis.", exception.getMessage());
    }

    @Test
    @DisplayName("Test 6 : Échec si l'index de l'hôpital est manquant")
    void testCreatePatient_IndexHopitalManquant_DoitEchouer() {
        patientAdulte.setIndexHopitalP(null); // Pas d'hôpital renseigné

        when(patientRepository.findAll()).thenReturn(Collections.emptyList());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            patientService.createPatient(patientAdulte);
        });

        assertEquals("L'index de l'hôpital est requis.", exception.getMessage());
    }
}