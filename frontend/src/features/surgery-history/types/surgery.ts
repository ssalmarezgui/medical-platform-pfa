export interface AntecedentChirurgical {
  identifiantACH?: number;
  intervention: string;
  date: string;
  lieu: string;
  chirurgien?: string;
  evolution: string;
  patientId?: string;
  donorId?: number;
}

export type CreateAntecedentChirurgicalDTO = Omit<AntecedentChirurgical, 'identifiantACH'>;