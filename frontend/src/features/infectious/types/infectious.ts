import { AnalyseDTO } from '../../hematology/types/hematology';

export interface MicrobiologieSerologie {
  identifiantMS?: number;
  typeMS: string;
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];
}

export type CreateMicrobiologieSerologieDTO = Omit<MicrobiologieSerologie, 'identifiantMS'>;