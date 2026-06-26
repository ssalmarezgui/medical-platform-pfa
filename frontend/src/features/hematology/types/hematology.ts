export interface AnalyseDTO {
  identifiantAna?: number;
  dateAna: string;
  resultatAna: string;
  valeurAna: string;
  typeAnalyse: string;
}

export interface HemotologieHemostase {
  identifiantHH?: number;
  groupeSanguin: string;
  phenotypage: string;
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];
}

export type CreateHematologyDTO = Omit<HemotologieHemostase, 'identifiantHH'>;