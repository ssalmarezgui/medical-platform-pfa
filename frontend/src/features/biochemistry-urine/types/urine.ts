import { AnalyseDTO } from '../../hematology/types/hematology';

export interface BiochimieUrines {
  identifiantBUF?: number;      // Auto-généré par le backend (IDENTITY)
  libelleBUF: string;           // ex: "Biochimie Urinaire et Fluides"
  descriptionBUF: string;       // Remarques / Observations
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];      // Liste des analyses urinaires rattachées
}

export type CreateBiochimieUrinesDTO = Omit<BiochimieUrines, 'identifiantBUF'>;