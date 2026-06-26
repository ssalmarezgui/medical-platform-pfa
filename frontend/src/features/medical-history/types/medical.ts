export interface AntecedentMedical {
  identifiantAMed?: number;
  type: string;    
  sousType: string;            
  dateDebut?: string;           
  complication?: string;       
  traitement?: string;
  evolution?: string;
  typeLocalisation?: string;
  causeSiege?: string;
  lieuPriseEnCharge?: string;
  patientId?: string;
  donorId?: number;
}

export type CreateAntecedentMedicalDTO = Omit<AntecedentMedical, 'identifiantAMed'>;