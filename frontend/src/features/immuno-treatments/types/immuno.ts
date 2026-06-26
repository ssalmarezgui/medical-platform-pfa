export interface TraitementImmunoSuppresseur {
  identifiantTIS?: number;
  dciTIS: string;
  durerTraitementTIS: string; 
  patientId: string;      
  typeTIS: 'INDUCTION' | 'ENTRETIEN';
  
  grafalonTISI?: boolean;
  atgTISI?: boolean;
  tymoglobulineTISI?: boolean;
  simulectTISI?: boolean;

  mmfTISE?: boolean;
  azathioprineTISE?: boolean;
  cyclusporineTISE?: boolean;
  tacrolimusTISE?: boolean;
  prednisoleTISE?: boolean;
  prednisoluneTISE?: boolean;
  sirolimus?: boolean;
}

export interface Medicament {
  identifiantMed?: number;
  nomCommercialMed: string;
  descriptionMed?: string;
  typeMed: string;
  posologieMed: string;
}

export interface Prescription {
  identifiantPrescription?: number;
  datePremierePrise: string;
  dosageMed: string;
  dateSortie?: string;
  traitementId: number;
  medicamentId: number;
  medicamentNomCommercial?: string;
  medicamentType?: string;
}

export interface DosageMedSang {
  identifiantDMS?: number;
  dateDMS: string;
  labelDMS: string;
  valeurDMS: string;
  observationDMS?: string;
  traitementId: number;
}