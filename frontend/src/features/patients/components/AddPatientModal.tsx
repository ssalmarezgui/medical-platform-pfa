import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePatient } from '../hooks/usePatients';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { patientSchema, PatientFormValues } from '../types/patients';
import { IconX, IconLoader } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

interface AddPatientProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPatientModal = ({ isOpen, onClose }: AddPatientProps) => {
  const createPatientMutation = useCreatePatient();
  const { data: hospitals } = useHospitals();
  const { data: doctors } = useDoctors();
  
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [selectedHospital, setSelectedHospital] = useState('');
  const investigators = doctors?.filter(doc => 
    doc.typeMedecin === 'INVESTIGATEUR' && 
    (selectedHospital === '' || doc.indexHopitalM === selectedHospital)
  );

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      nomP: '', 
      prenomP: '', 
      sexeP: 'M', 
      dateNaissP: '', 
      nationaliteP: 'Tunisienne',
      origineGeogP: '', 
      adresseP: '', 
      telephoneP: '', 
      adressEmailP: '',
      telephoneWhatsAppP: '', 
      personneAcontacterP: '', 
      typeCarnetP: '' as any,
      numCarnetP: '', 
      adulteP: true, 
      statut: 'ACTIF', 
      evolution: 'STABLE',
      niveauEducation: '', 
      enEtatActivite: true, 
      medecinInvestigateurId: undefined,
      numeroCin: '' as any
    }
  });

  const watchedHospital = watch('indexHopitalP');
  useEffect(() => { setSelectedHospital(watchedHospital || ''); }, [watchedHospital]);

  const onSubmit = async (data: PatientFormValues) => {
    console.log("CLIC ENREGISTRER : Données reçues", data); 
    try {
      const formattedData = {
        ...data,
        adulteP: typeof data.adulteP === 'string' ? data.adulteP === 'true' : !!data.adulteP,
        enEtatActivite: typeof data.enEtatActivite === 'string' ? data.enEtatActivite === 'true' : !!data.enEtatActivite,
        medecinInvestigateur: data.medecinInvestigateurId ? { identifiantM: Number(data.medecinInvestigateurId) } : null,
        affectations: [],
      };

      await createPatientMutation.mutateAsync(formattedData as any);
      setToastType('success');
      setToastMessage("Patient admis avec succès !");
      setToastOpen(true);
      reset();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      console.error("Détail de l'erreur :", error.response?.data);
      setToastType('error');
      setToastMessage(error.response?.data?.message || "Erreur lors de l'enregistrement.");
      setToastOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296]">Nouvelle Admission Patient</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><IconX size={20}/></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom *</label>
                <input {...register('nomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Sexe *</label>
                <select {...register('sexeP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date Naissance *</label>
                <input type="date" {...register('dateNaissP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro CIN *</label>
                <input type="text" maxLength={8} placeholder="Ex: 01234567" {...register('numeroCin')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nationalité *</label>
                <input {...register('nationaliteP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Origine Géo *</label>
                <input {...register('origineGeogP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Patient *</label>
                <select 
                  {...register('adulteP', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold"
                >
                  <option value="true">Adulte</option>
                  <option value="false">Pédiatrique</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">En activité *</label>
                <select 
                  {...register('enEtatActivite', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse *</label>
                <input {...register('adresseP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone *</label>
                <input placeholder="Ex: 98765432" {...register('telephoneP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">WhatsApp *</label>
                <input placeholder="Ex: 50123456" {...register('telephoneWhatsAppP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse Email *</label>
                <input type="email" placeholder="exemple@domaine.com" {...register('adressEmailP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Niveau d'éducation *</label>
                <input placeholder="Ex: Universitaire, Secondaire" {...register('niveauEducation')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Contact Urgence *</label>
                <input {...register('personneAcontacterP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Carnet *</label>
                <select {...register('typeCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="">Choisir...</option>
                  <option value="CNAM">CNAM</option>
                  <option value="CNSS">CNSS</option>
                  <option value="CNRPS">CNRPS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro Carnet *</label>
                <input {...register('numCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Statut Dossier *</label>
                <input placeholder="Ex: ACTIF, INACTIF" {...register('statut')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Évolution clinique *</label>
                <input placeholder="Ex: STABLE, AGGRAVATION" {...register('evolution')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Hôpital *</label>
                <select {...register('indexHopitalP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Sélectionner...</option>
                  {hospitals?.map(h => <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Médecin Investigateur *</label>
                <select {...register('medecinInvestigateurId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Associer...</option>
                  {investigators?.map(doc => <option key={doc.identifiantM} value={doc.identifiantM}>Dr. {doc.prenomM} {doc.nomM}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button 
                type="submit"
                disabled={createPatientMutation.isPending}
                className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center gap-2 shadow-lg shadow-[#006591]/20 border-none cursor-pointer disabled:opacity-50"
              >
                {createPatientMutation.isPending ? (
                  <>
                    <IconLoader className="animate-spin" size={16} /> Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};