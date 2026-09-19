package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AiResponseDTO;
import com.pfa.medical_backend.entities.PatientIdAdmin;
import com.pfa.medical_backend.entities.Transplantation;
import com.pfa.medical_backend.repositories.PatientIdAdminRepository;
import com.pfa.medical_backend.repositories.TransplantationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiClinicalServiceImplTest {

    @Mock
    private PatientIdAdminRepository patientRepository;

    @Mock
    private TransplantationRepository transplantationRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AiClinicalServiceImpl aiClinicalService;

    private PatientIdAdmin patientFull;
    private Transplantation transFull;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiClinicalService, "restTemplate", restTemplate);

        patientFull = new PatientIdAdmin();
        patientFull.setIdentifiantP("P100");
        patientFull.setSexeP("F");
        patientFull.setNationaliteP("Tunisienne");
        patientFull.setAdresseP("Sousse");
        patientFull.setTypeCarnetP("CNAM");
        patientFull.setStatut("Suivi");

        transFull = new Transplantation();
        transFull.setLieuDeLaGreffe("CHU");
        transFull.setLieuDeSuivi("Service A");
        transFull.setRein("Droit");
        transFull.setSondeEnDoubleJJ(true);
        transFull.setDureeIschemieFroide(90);
    }

    @Test
    void getPatientSummary_FullData() {
        when(patientRepository.findById("P100")).thenReturn(Optional.of(patientFull));
        when(transplantationRepository.findByPatient_IdentifiantP("P100")).thenReturn(List.of(transFull));
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(new AiResponseDTO());

        AiResponseDTO res = aiClinicalService.getPatientSummary("P100");

        assertNotNull(res);
        verify(auditLogService).logAuto(eq("GENERATION_SYNTHESE_IA"), contains("P100"), anyString());
    }

    @Test
    void getPatientSummary_NotFound() {
        when(patientRepository.findById("NONE")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> aiClinicalService.getPatientSummary("NONE"));
    }

    @Test
    void getPatientReport_WithNullFieldsAndFalseSonde() {
        // Couvre toutes les branches ternaires null et sonde false
        PatientIdAdmin pEmpty = new PatientIdAdmin();
        pEmpty.setIdentifiantP("P200");

        Transplantation tEmpty = new Transplantation();
        tEmpty.setSondeEnDoubleJJ(false); // test condition sonde == false

        when(patientRepository.findById("P200")).thenReturn(Optional.of(pEmpty));
        when(transplantationRepository.findByPatient_IdentifiantP("P200")).thenReturn(List.of(tEmpty));
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(new AiResponseDTO());

        AiResponseDTO res = aiClinicalService.getPatientReport("P200");

        assertNotNull(res);
        verify(auditLogService).logAuto(eq("GENERATION_RAPPORT_IA"), contains("P200"), anyString());
    }

    @Test
    void getPatientReport_EmptyTransplantationsList() {
        // Couvre la branche "Aucune chirurgie de greffe"
        when(patientRepository.findById("P100")).thenReturn(Optional.of(patientFull));
        when(transplantationRepository.findByPatient_IdentifiantP("P100")).thenReturn(Collections.emptyList());
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(new AiResponseDTO());

        AiResponseDTO res = aiClinicalService.getPatientReport("P100");

        assertNotNull(res);
    }

    @Test
    void getPatientReport_NullTransplantationsList() {
        // Couvre la branche où la liste est carrément null
        when(patientRepository.findById("P100")).thenReturn(Optional.of(patientFull));
        when(transplantationRepository.findByPatient_IdentifiantP("P100")).thenReturn(null);
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(new AiResponseDTO());

        AiResponseDTO res = aiClinicalService.getPatientReport("P100");

        assertNotNull(res);
    }
}