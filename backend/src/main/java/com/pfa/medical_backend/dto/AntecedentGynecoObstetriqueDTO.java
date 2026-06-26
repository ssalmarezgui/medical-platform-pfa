package com.pfa.medical_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AntecedentGynecoObstetriqueDTO {
    private Integer identifiantAGO;
    private LocalDate datePremieresRegles;
    private String menopause;
    private Integer grossessesNombreTotal;
    private Integer grossessesAvortementsProvoques;
    private Integer grossessesPreeclampsie;
    private Integer grossessesAccouchementsPrematures;
    private Integer grossessesAvortementsSpontanes;
    private Integer grossessesCesarienne;
    private String contraceptionMethodes;
    private String contraceptionDuree;
    private String pathologieMammaireGyneco;
    private String patientId;
    private Integer donorId;
}