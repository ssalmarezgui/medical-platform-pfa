import { AnalyseDTO } from '../../hematology/types/hematology';

export interface BilanImmunologique {
  identifiantBI?: number;
  typageHLA: string;
  bilanImmuno: string;
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];
}

export type CreateBilanImmunologiqueDTO = Omit<BilanImmunologique, 'identifiantBI'>;