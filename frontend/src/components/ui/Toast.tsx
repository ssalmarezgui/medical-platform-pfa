import { useEffect } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast = ({ message, isOpen, onClose, type = 'success' }: ToastProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-white border border-[#A7C0E4]/30 px-6 py-4 rounded-2xl shadow-xl shadow-blue-950/10 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
        type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
      }`}>
        {type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {type === 'success' ? 'Succès' : 'Erreur'}
        </span>
        <span className="text-xs font-semibold text-[#6588BB] mt-0.5">{message}</span>
      </div>

      <button 
        onClick={onClose}
        className="ml-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
      >
        <IconX size={16} />
      </button>
    </div>
  );
};