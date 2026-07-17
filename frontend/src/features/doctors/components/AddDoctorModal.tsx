import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDoctor } from '../hooks/useDoctors';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useServices } from '../../services/hooks/useServices';
import { doctorSchema, DoctorFormValues, TypeMedecin } from '../types/doctors';
import { IconX, IconLoader } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

interface AddDoctorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDoctorModal = ({ isOpen, onClose }: AddDoctorProps) => {
  const createDoctorMutation = useCreateDoctor();
  const { data: hospitals } = useHospitals();
  
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const { data: filteredServices, isLoading: loadingServices } = useServices(selectedHospital || undefined);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<DoctorFormValues & { identifiantM?: any }>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      identifiantM: '' as any,
      nomM: '',
      prenomM: '',
      sexeM: 'M',
      dateNaissM: '',
      numTelM: '',
      numTelWhapAPPM: '',
      adresseDomM: '',
      specialiteM: '',
      dateDernierDiplomeM: '',
      indexHopitalM: '',
      typeMedecin: 'SUIVI',
      autreInfo: '',
      serviceId: null
    }
  });

  const watchedHospital = watch('indexHopitalM');
  useEffect(() => {
    setSelectedHospital(watchedHospital || '');
  }, [watchedHospital]);


  const onSubmit = async (data: DoctorFormValues & { identifiantM?: any }) => {
    const rawMatricule = watch('identifiantM'); 
    const matricule = String(rawMatricule || '').trim();

    if (!matricule || isNaN(Number(matricule)) || matricule.length < 8 || matricule.length > 12) {
      setToastType('error');
      setToastMessage("Le matricule doit comporter entre 8 et 12 chiffres.");
      setToastOpen(true);
      return;
    }

    try {
      const formattedData: any = {
        identifiantM: Number(matricule),
        nomM: data.nomM,
        prenomM: data.prenomM,
        dateNaissM: data.dateNaissM,
        sexeM: data.sexeM,
        numTelM: data.numTelM,
        numTelWhapAPPM: data.numTelWhapAPPM || null,
        adresseDomM: data.adresseDomM,
        specialiteM: data.specialiteM,
        dateDernierDiplomeM: data.dateDernierDiplomeM,
        indexHopitalM: data.indexHopitalM,
        autreInfo: data.autreInfo || null,
        typeMedecin: data.typeMedecin as TypeMedecin,
        service: data.serviceId ? { identifiantS: Number(data.serviceId) } : null,
      };

      await createDoctorMutation.mutateAsync(formattedData);
      setToastType('success');
      setToastMessage("Le profil du médecin a été enregistré avec succès !");
      setToastOpen(true);
      reset();
      setTimeout(() => onClose(), 1000);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.response?.data?.message || "Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296]">Ajouter un Médecin</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Matricule Médecin (ID - de 8 à 12 chiffres) *</label>
              <input 
                type="text" 
                maxLength={12} 
                placeholder="" 
                {...register('identifiantM')} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-[#2B5296]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom *</label>
                <input {...register('nomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Nom du médecin" />
                {errors.nomM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nomM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Prénom" />
                {errors.prenomM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.prenomM.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Sexe *</label>
                <select {...register('sexeM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date de Naissance *</label>
                <input type="date" {...register('dateNaissM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.dateNaissM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.dateNaissM.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro de téléphone *</label>
                <input {...register('numTelM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Ex: 55 123 456" />
                {errors.numTelM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.numTelM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone WhatsApp</label>
                <input {...register('numTelWhapAPPM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Ex: 55 123 456" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse de domicile *</label>
              <input {...register('adresseDomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Adresse complète" />
              {errors.adresseDomM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.adresseDomM.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Spécialité *</label>
                <input {...register('specialiteM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Ex: Néphrologue, Immunologue" />
                {errors.specialiteM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.specialiteM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date d'obtention du diplôme *</label>
                <input type="date" {...register('dateDernierDiplomeM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.dateDernierDiplomeM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.dateDernierDiplomeM.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Profil Clinique *</label>
                <select {...register('typeMedecin')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296]">
                  <option value="SUIVI">Médecin de Suivi</option>
                  <option value="INVESTIGATEUR">Médecin Investigateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Hôpital d'affectation *</label>
                <select {...register('indexHopitalM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Sélectionner...</option>
                  {hospitals?.map(h => (
                    <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
                  ))}
                </select>
                {errors.indexHopitalM && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.indexHopitalM.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Pôle de soins (Service)</label>
                <select {...register('serviceId')} disabled={!selectedHospital || loadingServices} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296] disabled:opacity-50">
                  <option value="">Aucun service rattaché</option>
                  {filteredServices?.map(s => (
                    <option key={s.identifiantS} value={s.identifiantS}>{s.libelleS}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Remarques ou Autres informations</label>
              <textarea {...register('autreInfo')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm resize-none" placeholder="Notes additionnelles..." />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button type="submit" disabled={createDoctorMutation.isPending} className="bg-[#2B5296] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 flex items-center gap-2 border-none cursor-pointer">
                {createDoctorMutation.isPending ? <IconLoader className="animate-spin" size={16} /> : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};