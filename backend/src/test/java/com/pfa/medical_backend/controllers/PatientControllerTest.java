package com.pfa.medical_backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfa.medical_backend.dto.PatientDTO;
import com.pfa.medical_backend.entities.*;
import com.pfa.medical_backend.repositories.UserRepository;
import com.pfa.medical_backend.services.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PatientService patientService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatientController patientController;

    private PatientIdAdmin samplePatient;
    private PatientDTO sampleDTO;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController).build();

        // Médecin
        Medecin medecin = new Medecin();
        medecin.setIdentifiantM(10L);
        medecin.setNomM("Dupont");
        medecin.setPrenomM("Jean");

        // Hôpital & Service
        HopitalStructureSoin hopital = new HopitalStructureSoin();
        hopital.setIdentifiantH("HOP-01");

        ServiceMedical service = new ServiceMedical();
        service.setHopital(hopital);

        // Rôle
        Role role = new Role();
        role.setNomRole("ROLE_MEDECIN_SUIVI");

        // Utilisateur connecté
        sampleUser = new User();
        sampleUser.setLoginU("dr_dupont");
        sampleUser.setService(service);
        sampleUser.setRole(role);
        sampleUser.setMedecin(medecin);

        // Entité Patient
        samplePatient = new PatientIdAdmin();
        samplePatient.setIdentifiantP("P-001");
        samplePatient.setNomP("Ben Ali");
        samplePatient.setPrenomP("Ahmed");
        samplePatient.setIndexHopitalP("HOP-01");
        samplePatient.setMedecinInvestigateur(medecin);
        samplePatient.setMedecinsSuivi(new HashSet<>(Set.of(medecin)));

        // DTO Patient
        sampleDTO = new PatientDTO();
        sampleDTO.setIdentifiantP("P-001");
        sampleDTO.setNomP("Ben Ali");
        sampleDTO.setPrenomP("Ahmed");
        sampleDTO.setIndexHopitalP("HOP-01");
        sampleDTO.setMedecinInvestigateurId(10L);
        sampleDTO.setMedecinSuiviId(10L);
    }

    // ==========================================
    // GET ALL PATIENTS
    // ==========================================

    @Test
    void getAllPatients_WithoutAuth_ShouldReturnList() throws Exception {
        when(patientService.getPatientsAsDTO(eq("HOP-01"), isNull(), isNull()))
                .thenReturn(List.of(sampleDTO));

        mockMvc.perform(get("/api/patients")
                        .param("hopitalId", "HOP-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].identifiantP").value("P-001"));
    }

    @Test
    void getAllPatients_WithMedecinSuiviAuth_ShouldResolveContext() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "dr_dupont", null, List.of(new SimpleGrantedAuthority("ROLE_MEDECIN_SUIVI")));
        when(userRepository.findByLoginU("dr_dupont")).thenReturn(Optional.of(sampleUser));
        when(patientService.getPatientsAsDTO(eq("HOP-01"), isNull(), eq(10L)))
                .thenReturn(List.of(sampleDTO));

        mockMvc.perform(get("/api/patients")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    void getAllPatients_WithMedecinInvestigateurAuth_ShouldResolveContext() throws Exception {
        sampleUser.getRole().setNomRole("ROLE_MEDECIN_INVESTIGATEUR");
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "dr_dupont", null, List.of(new SimpleGrantedAuthority("ROLE_MEDECIN_INVESTIGATEUR")));
        when(userRepository.findByLoginU("dr_dupont")).thenReturn(Optional.of(sampleUser));
        when(patientService.getPatientsAsDTO(isNull(), eq(10L), isNull()))
                .thenReturn(List.of(sampleDTO));

        mockMvc.perform(get("/api/patients")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    // ==========================================
    // GET BY ID
    // ==========================================

    @Test
    void getById_Success() throws Exception {
        when(patientService.getPatientById("P-001")).thenReturn(Optional.of(samplePatient));

        mockMvc.perform(get("/api/patients/P-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifiantP").value("P-001"))
                .andExpect(jsonPath("$.nomP").value("Ben Ali"));
    }

    @Test
    void getById_NotFound() throws Exception {
        when(patientService.getPatientById("UNKNOWN")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/patients/UNKNOWN"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_ForbiddenForDifferentHopital() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "dr_dupont", null, List.of(new SimpleGrantedAuthority("ROLE_MEDECIN_SUIVI")));
        samplePatient.setIndexHopitalP("AUTRE_HOPITAL");

        when(patientService.getPatientById("P-001")).thenReturn(Optional.of(samplePatient));
        when(userRepository.findByLoginU("dr_dupont")).thenReturn(Optional.of(sampleUser));

        mockMvc.perform(get("/api/patients/P-001").principal(auth))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // CREATE
    // ==========================================

    @Test
    void createPatient_Success() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "dr_dupont", null, List.of(new SimpleGrantedAuthority("ROLE_MEDECIN_SUIVI")));
        when(userRepository.findByLoginU("dr_dupont")).thenReturn(Optional.of(sampleUser));
        when(patientService.createPatient(any(PatientIdAdmin.class))).thenReturn(samplePatient);

        mockMvc.perform(post("/api/patients")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identifiantP").value("P-001"));
    }

    @Test
    void createPatient_UserWithoutHospital_ShouldReturnBadRequest() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "dr_dupont", null, List.of(new SimpleGrantedAuthority("ROLE_MEDECIN_SUIVI")));
        sampleUser.setService(null); // Pas d'hôpital rattaché
        when(userRepository.findByLoginU("dr_dupont")).thenReturn(Optional.of(sampleUser));

        mockMvc.perform(post("/api/patients")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le médecin connecté n'est rattaché à aucun hôpital."));
    }

    // ==========================================
    // UPDATE & DELETE
    // ==========================================

    @Test
    void updatePatient_Success() throws Exception {
        when(patientService.updatePatient(eq("P-001"), any(PatientIdAdmin.class))).thenReturn(samplePatient);

        mockMvc.perform(put("/api/patients/P-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifiantP").value("P-001"));
    }

    @Test
    void deletePatient_Success() throws Exception {
        doNothing().when(patientService).deletePatient("P-001");

        mockMvc.perform(delete("/api/patients/P-001"))
                .andExpect(status().isNoContent());

        verify(patientService).deletePatient("P-001");
    }

    // ==========================================
    // SERVICES & MEDECINS ASSOCIATION
    // ==========================================

    @Test
    void affecterAuService_Success() throws Exception {
        when(patientService.affecterPatientAuService("P-001", 1)).thenReturn(samplePatient);

        mockMvc.perform(post("/api/patients/P-001/services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifiantP").value("P-001"));
    }

    @Test
    void desaffecterPatientDuService_Success() throws Exception {
        when(patientService.desaffecterPatientDuService("P-001", 1)).thenReturn(samplePatient);

        mockMvc.perform(delete("/api/patients/P-001/services/1"))
                .andExpect(status().isOk());
    }

    @Test
    void desaffecterPatientDuService_NotFound() throws Exception {
        when(patientService.desaffecterPatientDuService("P-001", 1))
                .thenThrow(new RuntimeException("Service introuvable"));

        mockMvc.perform(delete("/api/patients/P-001/services/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void assignerMedecin_Success() throws Exception {
        when(patientService.assignerMedecinAuPatient("P-001", 10L)).thenReturn(samplePatient);

        mockMvc.perform(post("/api/patients/P-001/medecins/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifiantP").value("P-001"));
    }

    @Test
    void retirerMedecinDuPatient_Success() throws Exception {
        when(patientService.retirerMedecinDuPatient("P-001", 10L)).thenReturn(samplePatient);

        mockMvc.perform(delete("/api/patients/P-001/medecins/10"))
                .andExpect(status().isOk());
    }

    @Test
    void retirerMedecinDuPatient_NotFound() throws Exception {
        when(patientService.retirerMedecinDuPatient("P-001", 10L))
                .thenThrow(new RuntimeException("Médecin introuvable"));

        mockMvc.perform(delete("/api/patients/P-001/medecins/10"))
                .andExpect(status().isNotFound());
    }
}