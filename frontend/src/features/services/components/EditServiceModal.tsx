import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateService } from '../hooks/useServices';
import { ServiceMedical } from '../types/services';
import { IconX, IconLoader } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';
import { z } from 'zod';

const serviceSchema = z.object({
  libelleS: z.string().min(3, { message: "Le nom du service doit comporter au moins 3 caractères." }),
  nbLitsS: z.coerce.number().min(0, { message: "Le nombre de lits ne peut pas être négatif." }),
  nbChambresS: z.coerce.number().min(0, { message: "Le nombre de chambres ne peut pas être négatif." }),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceMedical | null;
}

export const EditServiceModal = ({ isOpen, onClose, service }: EditServiceModalProps) => {
  const updateServiceMutation = useUpdateService();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as any,
  });

  useEffect(() => {
    if (service) {
      reset({
        libelleS: service.libelleS,
        nbLitsS: service.nbLitsS,
        nbChambresS: service.nbChambresS,
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: ServiceFormValues) => {
    if (!service || service.identifiantS === undefined) return;

    try {
      await updateServiceMutation.mutateAsync({
        id: service.identifiantS,
        data: data,
      });

      setToastType('success');
      setToastMessage("Le service hospitalier a été mis à jour avec succès !");
      setToastOpen(true);

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      setToastType('error');
      setToastMessage("Erreur lors de la mise à jour du service.");
      setToastOpen(true);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2B5296]">Modifier le Service</h2>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nom du Service (Spécialité) *</label>
              <input 
                {...register('libelleS')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
              />
              {errors.libelleS && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.libelleS.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nombre de chambres</label>
                <input 
                  type="number"
                  {...register('nbChambresS')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                />
                {errors.nbChambresS && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nbChambresS.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase tracking-wider mb-1.5">Nombre de lits</label>
                <input 
                  type="number"
                  {...register('nbLitsS')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm"
                />
                {errors.nbLitsS && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nbLitsS.message}</p>}
              </div>
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
                disabled={updateServiceMutation.isPending}
                className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center gap-2 shadow-lg shadow-[#006591]/20 border-none cursor-pointer disabled:opacity-50"
              >
                {updateServiceMutation.isPending ? (
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