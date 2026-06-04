import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateDoctor } from '../hooks/useDoctors';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useServices } from '../../services/hooks/useServices';
import { doctorSchema, DoctorFormValues, Medecin, TypeMedecin } from '../types/doctors';
import { IconX, IconLoader } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

interface EditDoctorProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Medecin | null;
}

export const EditDoctorModal = ({ isOpen, onClose, doctor }: EditDoctorProps) => {
  const updateDoctorMutation = useUpdateDoctor();
  const { data: hospitals } = useHospitals();
  
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const { data: filteredServices, isLoading: loadingServices } = useServices(selectedHospital || undefined);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema) as any,
  });

  const watchedHospital = watch('indexHopitalM');
  useEffect(() => {
    setSelectedHospital(watchedHospital || '');
  }, [watchedHospital]);

  useEffect(() => {
    if (doctor) {
      reset({
        nomM: doctor.nomM,
        prenomM: doctor.prenomM,
        dateNaissM: doctor.dateNaissM,
        sexeM: doctor.sexeM,
        numTelM: doctor.numTelM,
        numTelWhapAPPM: doctor.numTelWhapAPPM || '',
        adresseDomM: doctor.adresseDomM,
        specialiteM: doctor.specialiteM,
        dateDernierDiplomeM: doctor.dateDernierDiplomeM,
        indexHopitalM: doctor.indexHopitalM,
        autreInfo: doctor.autreInfo || '',
        typeMedecin: doctor.typeMedecin,
        serviceId: doctor.service?.identifiantS || null,
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: DoctorFormValues) => {
    if (!doctor || doctor.identifiantM === undefined) return;

    try {
      const formattedData: any = {
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

      await updateDoctorMutation.mutateAsync({
        id: doctor.identifiantM,
        data: formattedData,
      });

      setToastType('success');
      setToastMessage("Le profil du médecin a été mis à jour avec succès !");
      setToastOpen(true);

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch {
      setToastType('error');
      setToastMessage("Erreur de modification : vérifiez la cohérence clinique du pôle.");
      setToastOpen(true);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296]">Modifier le Profil du Médecin</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom *</label>
                <input {...register('nomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.nomM && <p className="text-red-500 text-xs mt-1">{errors.nomM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.prenomM && <p className="text-red-500 text-xs mt-1">{errors.prenomM.message}</p>}
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
                {errors.dateNaissM && <p className="text-red-500 text-xs mt-1">{errors.dateNaissM.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone *</label>
                <input {...register('numTelM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.numTelM && <p className="text-red-500 text-xs mt-1">{errors.numTelM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">WhatsApp (Optionnel)</label>
                <input {...register('numTelWhapAPPM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse de domicile *</label>
              <input {...register('adresseDomM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              {errors.adresseDomM && <p className="text-red-500 text-xs mt-1">{errors.adresseDomM.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Spécialité *</label>
                <input {...register('specialiteM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.specialiteM && <p className="text-red-500 text-xs mt-1">{errors.specialiteM.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Obtention du diplôme *</label>
                <input type="date" {...register('dateDernierDiplomeM')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                {errors.dateDernierDiplomeM && <p className="text-red-500 text-xs mt-1">{errors.dateDernierDiplomeM.message}</p>}
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
                {errors.indexHopitalM && <p className="text-red-500 text-xs mt-1">{errors.indexHopitalM.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Service clinique</label>
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
              <textarea {...register('autreInfo')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm resize-none" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button type="submit" disabled={updateDoctorMutation.isPending} className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] flex items-center gap-2 border-none cursor-pointer">
                {updateDoctorMutation.isPending ? <IconLoader className="animate-spin" size={16} /> : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};