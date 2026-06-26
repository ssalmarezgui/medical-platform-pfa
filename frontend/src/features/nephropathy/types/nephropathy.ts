export interface NephropathieInitiale {
  identifiantNI?: number;
  typeCliniqueNI: string;
  causeNI: string;
  typeHistologiqueNI: string;
  stadeMaladiNI: string;
  patientId: string;
}

export interface BilanPreGreffe {
  identifiantB?: number;
  dateBilanB: string;
  descriptionBilanB: string;
  resultatBilanB: string;
  rapportBilanB: string;
  nephropathieId: number;
}

export interface Dialyse {
  identifiantD?: number;
  typeDialyse: string;
  nephropathieId: number;
}

export interface ParametresBiopsiques {
  identifiantPB?: number;
  nephropathieId: number;
}