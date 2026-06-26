import { AnalyseDTO } from '../../hematology/types/hematology';

export interface BiochimieSang {
  identifiantBCS?: number;
  libelleBCS: string;           // ex: "Biochimie Sanguine"
  descriptionBCS: string;
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];
}

export type CreateBiochimieSangDTO = Omit<BiochimieSang, 'identifiantBCS'>;