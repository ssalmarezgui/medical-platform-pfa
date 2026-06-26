export interface MedicamentLongCours {
  identifiantMLC?: number;   
  libelleMLC: string;
  molecule: string;
  indication: string;
  debutTraitement?: string;
  patientId?: string;
  donorId?: number;
}

export type CreateMedicamentLongCoursDTO = Omit<MedicamentLongCours, 'identifiantMLC'>;