import { AnalyseDTO } from '../../hematology/types/hematology';

export interface HormonesVitamines {
  identifiantHV?: number;
  typeHV: string;// ex: "Hormones et Vitamines"
  patientId?: string;
  donorId?: number;
  analyses: AnalyseDTO[];
}

export type CreateHormonesVitaminesDTO = Omit<HormonesVitamines, 'identifiantHV'>;