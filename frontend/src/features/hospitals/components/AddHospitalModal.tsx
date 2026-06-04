import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateHospital } from '../hooks/useHospitals';
import { hospitalSchema, HospitalFormValues } from '../types/hospitals';
import { IconX, IconLoader } from '@tabler/icons-react';

import { Toast } from '../../../components/ui/Toast';
import { useState } from 'react';


interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHospitalModal = ({ isOpen, onClose }: AddHospitalModalProps) => {
  const createHospitalMutation = useCreateHospital();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HospitalFormValues>({
  resolver: zodResolver(hospitalSchema),
  defaultValues: {
    identifiantH: '',
    libelleH: '',
    adresseH: '',
    nbBlocH: 0,
    nbServiceH: 0,
    nbLitsH: 0,
    descriptionH: '',
    dateCreationH: new Date().toISOString().split('T')[0],
  }
});

  const onSubmit = async (data: HospitalFormValues) => {
    try {
        await createHospitalMutation.mutateAsync({ 
        ...data, 
        nbServiceH: 0 
        });
        setToastType('success');
        setToastMessage("Structure hospitalière enregistrée avec succès !");
        setToastOpen(true);

        reset();
        
        setTimeout(() => {
            onClose();
        }, 800);

    } catch (err) {

        setToastType('error');
        setToastMessage("Erreur d'enregistrement : ce code unique existe déjà.");
        setToastOpen(true);
    }
 };

  if (!isOpen) return null;

  return (
    <>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 mx-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2B5296]">Nouvel Établissement</h2>
            <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
            >
                <IconX size={20} />
            </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Code unique (10 caractères) *</label>
                <input 
                {...register('identifiantH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                placeholder="Ex: HOSP-TUNIS"
                />
                {errors.identifiantH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.identifiantH.message}</p>}
            </div>

            <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nom de l'établissement *</label>
                <input 
                {...register('libelleH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                placeholder="Ex: Clinique El Amen"
                />
                {errors.libelleH && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.libelleH.message}</p>}
            </div>

            <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Adresse *</label>
                <input 
                {...register('adresseH')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                placeholder="Ex: Rue des cliniques, Tunis"
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
                placeholder="Ajoutez des détails sur la structure..."
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
                    disabled={createHospitalMutation.isPending}
                    className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center gap-2 shadow-lg shadow-[#006591]/20 border-none cursor-pointer disabled:opacity-50"
                    >
                    {createHospitalMutation.isPending ? (
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
        <Toast 
            isOpen={toastOpen} 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setToastOpen(false)} 
        />
    </>
  );
};