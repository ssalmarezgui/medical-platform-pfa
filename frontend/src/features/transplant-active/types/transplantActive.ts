export interface Transplantation {
  numeroTR?: number;
  dateTR: string;
  lieuDeLaGreffe: string;
  lieuDeSuivi: string;
  nbTransplantation: number;
  nbUretere: number;
  rein: 'Gauche' | 'Droit';
  nbArtereVeine: number;
  kystes: boolean;
  typeAnomalie?: string;
  dureeIschemieFroide?: number;
  dureeIschemieChaude?: number;
  liquideConservation: string;
  liquideRincage: string;
  machineAPerfusion: boolean;
  typeAnastomoseArterielle: string;
  typeAnastomoseVeineuse: string;
  typeAnastomoseUreteroVesicale: string;
  sondeEnDoubleJJ: boolean;
  
  patientId: string;
  patientNomComplet?: string;
  donneurId: number; 
  donneurNomComplet?: string;
}

export type CreateTransplantationDTO = Omit<Transplantation, 'numeroTR'>;