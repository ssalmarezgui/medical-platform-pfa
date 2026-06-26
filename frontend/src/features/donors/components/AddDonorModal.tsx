import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDonor } from '../hooks/useDonors';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { useAuthStore } from '../../../store/useAuthStore';
import { IconX, IconLoader, IconUsers } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

// --- SCHÉMA DE VALIDATION DE SÉCURITÉ CLINIQUE (ZOD) ---
const donorSchema = z.object({
  nomD: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  prenomD: z.string().min(2, "Le prénom doit comporter au moins 2 caractères."),
  sexeD: z.enum(['M', 'F']),
  dateNaissD: z.string().min(1, "La date de naissance est requise."),
  nationaliteD: z.string().min(1, "La nationalité est requise."),
  origineGeogD: z.string().optional(),
  adresseDomD: z.string().min(5, "L'adresse doit comporter au moins 5 caractères."),
  telephoneD: z.string().min(8, "Le numéro de téléphone doit faire au moins 8 chiffres."),
  adresseEmailD: z.string().email("Format d'adresse e-mail invalide.").or(z.literal('')),
  telephoneWhatsAppD: z.string().optional(),
  personneAcontacterD: z.string().min(2, "Le contact d'urgence est requis."),
  typeCarnetD: z.string().optional(),
  numCarnetD: z.string().optional(),
  adulteD: z.boolean(),
  statut: z.string().optional(),
  evolutionProf: z.string().optional(),
  niveauEducation: z.string().optional(),
  enEtatActivite: z.boolean(),
  cinD: z.string().max(8, "Le CIN ne peut pas dépasser 8 caractères.").min(1, "Le CIN est requis."),
  indexHopitalD: z.string().min(1, "L'hôpital est requis."),
  typeDonneur: z.string().min(1, "Veuillez préciser le type de donneur (champ libre).") // Champ textuel libre !
});

type DonorFormValues = z.infer<typeof donorSchema>;

interface AddDonorProps {
  isOpen: boolean;
  onClose: () => void;
  donor?: any | null;
}

export const AddDonorModal = ({ isOpen, onClose, donor }: AddDonorProps) => {
  const createDonorMutation = useCreateDonor();
  const { data: hospitals } = useHospitals();
  const { data: doctors } = useDoctors();
  const { user } = useAuthStore();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [selectedHospital, setSelectedHospital] = useState('');
  const isInvestigateur = user?.roleU === 'MEDECIN_INVESTIGATEUR';

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema) as any,
    defaultValues: {
      nomD: '',
      prenomD: '',
      sexeD: 'M',
      dateNaissD: '',
      nationaliteD: 'Tunisienne',
      origineGeogD: '',
      adresseDomD: '',
      telephoneD: '',
      adresseEmailD: '',
      telephoneWhatsAppD: '',
      personneAcontacterD: '',
      typeCarnetD: '',
      numCarnetD: '',
      adulteD: true,
      statut: '',
      evolutionProf: '',
      niveauEducation: '',
      enEtatActivite: true,
      cinD: '',
      indexHopitalD: '',
      typeDonneur: ''
    }
  });

  const watchedHospital = watch('indexHopitalD');
  useEffect(() => { setSelectedHospital(watchedHospital || ''); }, [watchedHospital]);

  // --- AUTO-AFFECTATION DE L'HÔPITAL DE SESSION ---
  useEffect(() => {
    if (isOpen && isInvestigateur && doctors && user) {
      const matchedDoctor = doctors.find(doc => doc.typeMedecin === 'INVESTIGATEUR');
      if (matchedDoctor) {
        setValue('indexHopitalD', matchedDoctor.indexHopitalM);
        setSelectedHospital(matchedDoctor.indexHopitalM);
      }
    }
  }, [isOpen, isInvestigateur, doctors, user, setValue]);

  // Calcul d'âge dynamique
  const watchedDateNaiss = watch('dateNaissD');
  useEffect(() => {
    if (watchedDateNaiss) {
      const birthDate = new Date(watchedDateNaiss);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setValue('adulteD', calculatedAge >= 18);
    }
  }, [watchedDateNaiss, setValue]);

  // Remplissage si mode édition
  useEffect(() => {
    if (donor) {
      reset(donor);
    } else {
      resetForm();
    }
  }, [donor, isOpen]);

  const resetForm = () => {
    reset({
      nomD: '',
      prenomD: '',
      sexeD: 'M',
      dateNaissD: '',
      nationaliteD: 'Tunisienne',
      origineGeogD: '',
      adresseDomD: '',
      telephoneD: '',
      adresseEmailD: '',
      telephoneWhatsAppD: '',
      personneAcontacterD: '',
      typeCarnetD: '',
      numCarnetD: '',
      adulteD: true,
      statut: '',
      evolutionProf: '',
      niveauEducation: '',
      enEtatActivite: true,
      cinD: '',
      indexHopitalD: '',
      typeDonneur: ''
    });
  };

  const handleCloseWithReset = () => {
    resetForm();
    onClose();
  };

  const watchedAdulte = watch('adulteD');
  const isAdulteSelected = watchedAdulte === true || String(watchedAdulte) === 'true';

  const onSubmit = async (data: DonorFormValues) => {
    const isDonorAdulte = typeof data.adulteD === 'string' ? data.adulteD === 'true' : !!data.adulteD;
    
    try {
      const formattedData = {
        ...data,
        adulteD: isDonorAdulte,
        enEtatActivite: typeof data.enEtatActivite === 'string' ? data.enEtatActivite === 'true' : !!data.enEtatActivite,
        cinD: data.cinD ? String(data.cinD).trim() : null
      };

      await createDonorMutation.mutateAsync(formattedData);
      setToastType('success');
      setToastMessage("Le donneur a été enregistré avec succès !");
      setToastOpen(true);
      resetForm();
      setTimeout(onClose, 1000);
    } catch {
      setToastType('error');
      setToastMessage("Erreur lors de l'enregistrement du donneur.");
      setToastOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
              <IconUsers size={24} />
              {donor ? "Modifier la fiche du Donneur" : "Nouvelle Saisie Donneur"}
            </h2>
            <button onClick={handleCloseWithReset} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 border-none bg-transparent cursor-pointer">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-100 text-red-700 text-xs rounded-xl">
                <strong>Erreurs de formulaire :</strong>
                <ul className="list-disc ml-4 mt-1">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{key}: {(error as any).message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom *</label>
                <input {...register('nomD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
            </div>

            {/* Sexe, Date de naissance et CIN */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Sexe *</label>
                <select {...register('sexeD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date Naissance *</label>
                <input type="date" {...register('dateNaissD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">
                  {isAdulteSelected ? "Numéro CIN *" : "CIN du Parent *"}
                </label>
                <input 
                  type="text" 
                  maxLength={8} 
                  placeholder={isAdulteSelected ? "Ex: 01234567" : "CIN du tuteur legal"} 
                  {...register('cinD')} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-semibold" 
                />
              </div>
            </div>

            {/* Nationalité & Origine Géo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nationalité *</label>
                <input {...register('nationaliteD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Origine Géo *</label>
                <input {...register('origineGeogD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
            </div>

            {/* Type Patient & En activité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Donneur  *</label>
                <select 
                  {...register('adulteD', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold outline-none"
                >
                  <option value="true">Adulte</option>
                  <option value="false">Pédiatrique</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">En activité *</label>
                <select 
                  {...register('enEtatActivite', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold outline-none"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>

            {/* Adresse & Téléphones */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse *</label>
                <input {...register('adresseDomD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone *</label>
                <input placeholder="Ex: 98765432" {...register('telephoneD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">WhatsApp</label>
                <input placeholder="Ex: 50123456" {...register('telephoneWhatsAppD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
            </div>

            {/* Adresse Email & Niveau d'éducation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse Email</label>
                <input type="email" placeholder="exemple@domaine.com" {...register('adresseEmailD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Niveau d'éducation</label>
                <input placeholder="Ex: Universitaire, Secondaire" {...register('niveauEducation')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
            </div>

            {/* Contact Urgence, Type Carnet & Numéro Carnet */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Contact Urgence *</label>
                <input {...register('personneAcontacterD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Carnet</label>
                <select {...register('typeCarnetD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
                  <option value="">Choisir...</option>
                  <option value="CNAM">CNAM</option>
                  <option value="CNSS">CNSS</option>
                  <option value="CNRPS">CNRPS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro Carnet</label>
                <input {...register('numCarnetD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white" />
              </div>
            </div>

            {/* Statut & Évolution Prof */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Statut Dossier *</label>
                <input {...register('statut')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Évolution clinique *</label>
                <input {...register('evolutionProf')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-bold" />
              </div>
            </div>

            {/* Hôpital et Type Donneur Saisie Libre */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type de Donneur *</label>
                <input 
                  type="text" 
                  required 
                  {...register('typeDonneur')} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none font-bold text-[#2B5296]" 
                  placeholder=""
                />
              </div>

              <div>
                {!isInvestigateur ? (
                  <div>
                    <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Hôpital d'affectation *</label>
                    <select {...register('indexHopitalD')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296] outline-none">
                      <option value="">Sélectionner...</option>
                      {hospitals?.map(h => (
                        <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between h-[42px] mt-6">
                    <span className="text-[10px] font-bold text-[#2B5296] uppercase tracking-wider">Affectation Hôpital Automatique</span>
                    <span className="text-[10px] font-bold text-slate-600">
                      Hôpital : {hospitals?.find(h => h.identifiantH === watchedHospital)?.libelleH || watchedHospital}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t justify-end">
              <button type="button" onClick={handleCloseWithReset} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button type="submit" disabled={createDonorMutation.isPending} className="bg-[#2B5296] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer flex items-center gap-1.5">
                {createDonorMutation.isPending ? <IconLoader className="animate-spin" size={16} /> : "Enregistrer le Donneur"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};