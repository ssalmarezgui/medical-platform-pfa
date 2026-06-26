export interface Imagerie {
  identifiantIm?: number; 
  examenIm: string;
  dateIm: string;
  resultatIm: string;
  patientId?: string;
  donorId?: number;
}

export type CreateImagerieDTO = Omit<Imagerie, 'identifiantIm'>;