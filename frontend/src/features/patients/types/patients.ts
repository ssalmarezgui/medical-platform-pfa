import { z } from 'zod';

export interface Patient {
  identifiantP: string;       
  indexHopitalP: string;       
  numeroCin: number;           
  nomP: string;
  prenomP: string;
  dateNaissP: string;          
  sexeP: 'M' | 'F';
  nationaliteP: string;
  origineGeogP: string;         
  adresseP: string;
  telephoneP: string;
  adressEmailP: string;
  telephoneWhatsAppP: string;
  personneAcontacterP: string;    
  typeCarnetP: 'CNAM' | 'CNSS' | 'CNRPS' | 'cnam' | 'cnss' | 'cnrps';         
  numCarnetP: string;         
  adulteP: boolean;             
  statut: string;           
  evolution: string;           
  niveauEducation: string;      
  enEtatActivite: boolean;      
  medecinInvestigateur: {    
    identifiantM: number;
    nomM: string;
    prenomM: string;
  };
}

export type CreatePatientDTO = Omit<Patient, 'identifiantP'>;

export const patientSchema = z.object({
  nomP: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères." }),
  prenomP: z.string().min(2, { message: "Le prénom doit comporter au moins 2 caractères." }),
  indexHopitalP: z.string().min(1, { message: "Veuillez associer un établissement." }),
  
  numeroCin: z.string()
    .regex(/^\d{8}$/, { message: "Le CIN doit comporter exactement 8 chiffres." })
    .transform((val) => parseInt(val, 10)),

  dateNaissP: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "La date de naissance est requise." }),
  sexeP: z.enum(['M', 'F'], { errorMap: () => ({ message: "Le genre est requis." }) }),
  nationaliteP: z.string().min(2, { message: "La nationalité est requise." }),
  origineGeogP: z.string().min(2, { message: "L'origine géographique est requise." }),
  adresseP: z.string().min(1, { message: "L'adresse est requise." }),

  telephoneP: z.string()
    .regex(/^[259]\d{7}$/, { message: "Le numéro doit commencer par 2, 5 ou 9 et contenir 8 chiffres." }),

  adressEmailP: z.string().email({ message: "Adresse email invalide." }),

  telephoneWhatsAppP: z.string()
    .regex(/^[259]\d{7}$/, { message: "Le numéro WhatsApp doit commencer par 2, 5 ou 9 et contenir 8 chiffres." }),

  personneAcontacterP: z.string().min(3, { message: "Veuillez indiquer un contact d'urgence." }),
  
  typeCarnetP: z.enum(['CNAM', 'CNSS', 'CNRPS', 'cnam', 'cnss', 'cnrps'], {
    errorMap: () => ({ message: "Le type de carnet doit être CNAM, CNSS ou CNRPS." })
  }),

  numCarnetP: z.string()
    .regex(/^[a-zA-Z0-9]+$/, { message: "Le numéro de carnet doit contenir uniquement des lettres ou des chiffres." }),

  adulteP: z.boolean({ required_error: "Ce champ est requis." }),
  statut: z.string().min(2, { message: "Veuillez sélectionner le statut actuel du dossier." }),
  evolution: z.string().min(1, { message: "Ce champ est requis." }),
  niveauEducation: z.string().min(1, { message: "Ce champ est requis." }),
  enEtatActivite: z.boolean({ required_error: "Ce champ est requis." }),
  
  medecinInvestigateurId: z.coerce.number().min(1, { message: "Veuillez associer un médecin investigateur." }),
});

export type PatientFormValues = z.infer<typeof patientSchema>;