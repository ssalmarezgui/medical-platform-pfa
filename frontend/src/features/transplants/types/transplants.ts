export interface TransplantationAnterieure {
  identifiantTR?: number;
  dateTR: string;
  lieuTR: string;
  lieuSuiviTR: string;
  typeDonneur: string;
  hlaDonneur: string;
  traitementImmunoSuppresseurInduction: string;
  traitementImmunoSuppresseurEntretien: string;
  causePerteGreffonRenale: string;
  dateRetourDialyse?: string;
  transplantectomie: boolean;
  transplantectomieIndication?: string;
  patientId: string;
}

export type CreateTransplantationAnterieureDTO = Omit<TransplantationAnterieure, 'identifiantTR'>;