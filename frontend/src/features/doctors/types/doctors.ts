import { z } from 'zod';

export type TypeMedecin = 'SUIVI' | 'INVESTIGATEUR';

export interface Medecin {
  identifiantM?: number;   
  nomM: string;           
  prenomM: string;          
  dateNaissM: string;     
  sexeM: string;       
  numTelM: string;    
  numTelWhapAPPM?: string;  
  adresseDomM: string;  
  specialiteM: string;  
  dateDernierDiplomeM: string; 
  indexHopitalM: string; 
  autreInfo?: string;  
  typeMedecin: TypeMedecin; 
  service?: {             
    identifiantS: number;
    libelleS?: string;
  } | null;
}

export type CreateMedecinDTO = Medecin;


export const doctorSchema = z.object({
  nomM: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères." }),
  prenomM: z.string().min(2, { message: "Le prénom doit comporter au moins 2 caractères." }),
  dateNaissM: z.string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "La date de naissance est requise." })
    .refine((val) => {
      const annee = new Date(val).getFullYear();
      const anneeEnCours = new Date().getFullYear();
      return annee >= 1900 && annee <= (anneeEnCours - 18);
    }, { message: "L'année de naissance doit être valide et le médecin doit avoir au moins 18 ans." }),
  sexeM: z.string().min(1, { message: "Le sexe est requis." }),
  numTelM: z.string().min(8, { message: "Le numéro de téléphone doit faire au moins 8 chiffres." }),
  numTelWhapAPPM: z.string().optional(),
  adresseDomM: z.string().min(5, { message: "L'adresse de domicile doit faire au moins 5 caractères." }),
  specialiteM: z.string().min(3, { message: "La spécialité est requise." }),
  dateDernierDiplomeM: z.string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "La date du diplôme est requise." })
    .refine((val) => {
      const annee = new Date(val).getFullYear();
      const anneeEnCours = new Date().getFullYear();
      return annee >= 1950 && annee <= anneeEnCours;
    }, { message: "La date d'obtention du diplôme doit être réaliste et ne peut pas être dans le futur." }),
  indexHopitalM: z.string().min(1, { message: "Veuillez associer un hôpital." }),
  autreInfo: z.string().optional(),
  typeMedecin: z.enum(['SUIVI', 'INVESTIGATEUR'], { 
    errorMap: () => ({ message: "Veuillez sélectionner un type de profil." }) 
  }),
  serviceId: z.coerce.number().optional().nullable(),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;