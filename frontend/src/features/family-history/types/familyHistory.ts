export interface AntecedentFamilial {
  identifiantAF?: number;
  consanguinite: string;
  typeRelation: string;
  dateDeNaissance?: string;
  profession?: string;
  tares: string;
  patientId?: string;
  donorId?: number;
}

export type CreateAntecedentFamilialDTO = Omit<AntecedentFamilial, 'identifiantAF'>;