export interface MarqueursTumoraux {
  identifiantMT?: number;    
  nomM: string;                 
  resultat: string;             
  patientId?: string;
  donorId?: number;         
}

export type CreateMarqueursTumorauxDTO = Omit<MarqueursTumoraux, 'identifiantMT'>;