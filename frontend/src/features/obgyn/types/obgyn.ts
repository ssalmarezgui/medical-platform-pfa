export interface AntecedentGynecoObstetrique {
  identifiantAGO?: number;
  datePremieresRegles?: string;
  menopause: string;
  grossessesNombreTotal: number;
  grossessesAvortementsProvoques: number;
  grossessesPreeclampsie: number;
  grossessesAccouchementsPrematures: number;
  grossessesAvortementsSpontanes: number;
  grossessesCesarienne: number;
  contraceptionMethodes?: string;
  contraceptionDuree?: string;
  pathologieMammaireGyneco?: string;
  patientId?: string;
  donorId?: number;                 
}

export type CreateObgynDTO = Omit<AntecedentGynecoObstetrique, 'identifiantAGO'>;