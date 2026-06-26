export interface Donneur {
  identifiantD?: number;
  nomD: string;
  prenomD: string;
  nationaliteD: string;
  sexeD: string;
  origineGeogD: string;
  adresseDomD: string;
  telephoneD: string;
  adresseEmailD?: string;
  telephoneWhatsAppD?: string;
  dateNaissD: string;
  personneAcontacterD: string;
  typeCarnetD: string;
  numCarnetD: string;
  indexHopitalD: string;
  adulteD: boolean;
  cinD: string;
  statut: string;
  evolutionProf?: string;
  niveauEducation?: string;
  enEtatActivite: boolean;
  typeDonneur: string;
}

export type CreateDonneurDTO = Omit<Donneur, 'identifiantD'>;