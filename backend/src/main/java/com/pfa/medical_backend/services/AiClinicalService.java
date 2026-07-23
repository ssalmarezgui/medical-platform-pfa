package com.pfa.medical_backend.services;

import com.pfa.medical_backend.dto.AiResponseDTO;

public interface AiClinicalService {
    AiResponseDTO getPatientSummary(String uuid);

    AiResponseDTO getPatientReport(String uuid);
}