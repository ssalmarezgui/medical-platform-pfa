export interface Habitude {
  identifiantHA?: number;
  libelleHA: string;
  typeSubstance: string;
  details?: string;
  quantiteConsomme?: string;
  periodeExposition?: string;
  sevrage?: string;
  patientId?: string; 
  donorId?: number;
}

export type CreateHabitudeDTO = Omit<Habitude, 'identifiantHA'>;