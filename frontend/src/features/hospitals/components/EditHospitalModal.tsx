import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateHospital } from '../hooks/useHospitals';
import { hospitalSchema, HospitalFormValues, HopitalStructureSoin } from '../types/hospitals';
import { IconX, IconLoader } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast'; 

interface EditHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: HopitalStructureSoin | null;
}

export const EditHospitalModal = ({ isOpen, onClose, hospital }: EditHospitalModalProps) => {
  const updateHospitalMutation = useUpdateHospital();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema) as any,
  });

  useEffect(() => {
    if (hospital) {
      reset({
        identifiantH: hospital.identifiantH,
        libelleH: hospital.libelleH,
        adresseH: hospital.adresseH,
        nbBlocH: hospital.nbBlocH,
        nbServiceH: hospital.nbServiceH,
        nbLitsH: hospital.nbLitsH,
        descriptionH: hospital.descriptionH,
        dateCreationH: hospital.dateCreationH,
      });
    }
  }, [hospital, reset]);

  const onSubmit = async (data: HospitalFormValues) => {
    if (!hospital) return;

    try {
      await updateHospitalMutation.mutateAsync({
        id: hospital.identifiantH,
        data: data,
      });

      setToastType('success');
      setToastMessage("L'établissement a été mis à jour avec succès !");
      setToastOpen(true);

      setTimeout(() => {
        onClose();
      }, 800);

    } catch (err) {
      setToastType('error');
      setToastMessage("Erreur lors de la mise à jour de l'établissement.");
      setToastOpen(true);
    }
  };

  if (!isOpen || !hospital) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2B5296]">Modifier l'Établissement</h2>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
            >
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Code unique (Non modifiable)</label>
              <input 
                {...register('identifiantH')}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 outline-none text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nom de l'établissement *</label>
              <input 
                {...register('libelleH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
              />
              {errors.libelleH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.libelleH.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Adresse *</label>
              <input 
                {...register('adresseH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
              />
              {errors.adresseH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.adresseH.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Blocs opératoires</label>
                <input 
                  type="number"
                  {...register('nbBlocH')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                />
                {errors.nbBlocH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nbBlocH.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nombre de Lits</label>
                <input 
                  type="number"
                  {...register('nbLitsH')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                />
                {errors.nbLitsH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nbLitsH.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Date de création *</label>
              <input 
                type="date"
                {...register('dateCreationH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
              />
              {errors.dateCreationH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.dateCreationH.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Description détaillée *</label>
              <textarea 
                {...register('descriptionH')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm resize-none"
              />
              {errors.descriptionH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.descriptionH.message}</p>}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors border-none cursor-pointer bg-transparent"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={updateHospitalMutation.isPending}
                className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center gap-2 shadow-lg shadow-[#006591]/20 border-none cursor-pointer disabled:opacity-50"
              >
                {updateHospitalMutation.isPending ? (
                  <>
                    <IconLoader className="animate-spin" size={16} /> Enregistrement...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      <Toast 
        isOpen={toastOpen} 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
      />
    </>
  );
};