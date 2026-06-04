export interface ServiceMedical {
  identifiantS?: number;
  libelleS: string;
  nbLitsS: number;
  nbChambresS: number;
  nbMedecinsS?: number;
  idHopital?: string;
  hopitalName?: string;
}

export type CreateServiceDTO = Omit<ServiceMedical, 'identifiantS' | 'nbMedecinsS'>;