import { IconAlertTriangle, IconX } from '@tabler/icons-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-[30px] shadow-2xl border border-slate-100 max-w-md w-full text-center mx-4">
      
        <div className="flex justify-end -mt-4 -mr-4">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <IconAlertTriangle size={32} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-[#6588BB] text-xs font-semibold mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full h-12 bg-red-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20 border-none cursor-pointer"
          >
            Oui, supprimer définitivement
          </button>
          <button 
            onClick={onClose}
            className="w-full h-12 bg-[#F1F5FB] text-[#2B5296] rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#E2E8F0] transition-all border-none cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};