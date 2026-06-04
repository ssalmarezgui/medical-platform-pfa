import { z } from 'zod';
// zod est une bibliothèque de validation de schéma pour TypeScript et JavaScript. 
// Elle permet de définir des schémas de données 
// et de valider les données contre ces schémas.

export interface HopitalStructureSoin{
    identifiantH: string;
    libelleH: string;
    adresseH: string;
    nbBlocH: number;
    nbServiceH: number;
    nbLitsH: number;
    descriptionH: string;
    dateCreationH: string;

    // au future je peux ajouter services  

}

export type CreateHopitalDTO = HopitalStructureSoin;

export const hospitalSchema = z.object({
  identifiantH: z.string()
    .length(10, { message: "Le code unique doit comporter exactement 10 caractères." }),
  libelleH: z.string()
    .min(3, { message: "Le nom doit comporter au moins 3 caractères." }),
  adresseH: z.string()
    .min(5, { message: "L'adresse doit comporter au moins 5 caractères." }),
  nbBlocH: z.coerce.number()
    .min(0, { message: "Le nombre de blocs ne peut pas être négatif." }),
  nbLitsH: z.coerce.number()
    .min(0, { message: "Le nombre de lits ne peut pas être négatif." }),
  descriptionH: z.string()
    .min(10, { message: "La description doit faire au moins 10 caractères." }),
  dateCreationH: z.string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "La date de création est requise." }),
});

export type HospitalFormValues = z.infer<typeof hospitalSchema>;