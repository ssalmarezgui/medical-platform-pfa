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

    private PatientIdAdmin patient;
    private Transplantation transplantation;

    @BeforeEach
    void setUp() {
        // Injection du mock RestTemplate dans le service
        ReflectionTestUtils.setField(aiClinicalService, "restTemplate", restTemplate);

        patient = new PatientIdAdmin();
        patient.setIdentifiantP("P123");
        patient.setSexeP("M");
        patient.setNationaliteP("Tunisienne");
        patient.setAdresseP("Tunis");
        patient.setTypeCarnetP("CNAM");
        patient.setStatut("Hospitalisé");

        transplantation = new Transplantation();
        transplantation.setLieuDeLaGreffe("Hôpital Charles Nicolle");
        transplantation.setLieuDeSuivi("Service Néphrologie");
        transplantation.setRein("Gauche");
        transplantation.setSondeEnDoubleJJ(true);
        transplantation.setDureeIschemieFroide(120);
    }

    @Test
    void getPatientSummary_Success_WithTransplantation() {
        AiResponseDTO mockResponse = new AiResponseDTO();

        when(patientRepository.findById("P123")).thenReturn(Optional.of(patient));
        when(transplantationRepository.findByPatient_IdentifiantP("P123")).thenReturn(List.of(transplantation));
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(mockResponse);

        AiResponseDTO result = aiClinicalService.getPatientSummary("P123");

        assertNotNull(result);
        verify(auditLogService).logAuto(eq("GENERATION_SYNTHESE_IA"), contains("P123"), anyString());
    }

    @Test
    void getPatientSummary_PatientNotFound_ShouldThrowException() {
        when(patientRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> aiClinicalService.getPatientSummary("UNKNOWN"));
    }

    @Test
    void getPatientReport_Success_WithoutTransplantation() {
        // Cas où les champs du patient sont nuls pour tester les branches "Non renseigné"
        PatientIdAdmin emptyPatient = new PatientIdAdmin();
        emptyPatient.setIdentifiantP("P999");

        AiResponseDTO mockResponse = new AiResponseDTO();

        when(patientRepository.findById("P999")).thenReturn(Optional.of(emptyPatient));
        when(transplantationRepository.findByPatient_IdentifiantP("P999")).thenReturn(Collections.emptyList());
        when(restTemplate.postForObject(anyString(), any(), eq(AiResponseDTO.class))).thenReturn(mockResponse);

        AiResponseDTO result = aiClinicalService.getPatientReport("P999");

        assertNotNull(result);
        verify(auditLogService).logAuto(eq("GENERATION_RAPPORT_IA"), contains("P999"), anyString());
    }
}