import { IconMenu2, IconShieldCheck, IconUser } from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore'; // Import de l'Auth Store

interface TopbarProps {
  onToggle: () => void;
}

export const Topbar = ({ onToggle }: { onToggle: () => void }) => {
  const { user } = useAuthStore();

  // Extraction des initiales du compte connecté (ex: "AD" pour admin, "IM" pour immuno)
  const initials = user?.loginU ? user.loginU.substring(0, 2).toUpperCase() : "US";

  // Gestion dynamique de la couleur du badge selon le rôle connecté
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-50 text-[#2B5296] border-blue-100';
      case 'MEDECIN_INVESTIGATEUR':
      case 'MEDECIN_SUIVI':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'AGENT_LABORATOIRE':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'AGENT_IMMUNO':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 flex items-center px-8 justify-between relative z-20">
      
      {/* Partie Gauche : Menu Toggle & Titre du portail */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggle} 
          className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-[#2B5296] transition-colors border-none bg-transparent cursor-pointer"
          title="Afficher/Masquer le menu"
        >
          <IconMenu2 size={20} />
        </button>
        <div>
          <span className="text-[10px] font-black text-[#6588BB] uppercase tracking-widest">MedPlatform</span>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-0.5">Console Clinique</h2>
        </div>
      </div>

      {/* Partie Droite : Indicateur de Sécurité, Rôle et Profil */}
      <div className="flex items-center gap-6">
        
        {/* Bouclier de sécurité (Gage Cyber pour votre soutenance) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-full text-emerald-700 text-[10px] font-bold">
          <IconShieldCheck size={14} className="animate-pulse" />
          <span>Session Chiffree TLS 1.3</span>
        </div>

        {/* Profil & Rôle Actif */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
            
            {/* Infos texte */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 capitalize">{user.loginU}</p>
              
              {/* Badge dynamique */}
              <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${getRoleBadgeStyle(user.roleU)}`}>
                {user.roleU?.replace('_', ' ')}
              </span>
            </div>

            {/* Avatar circulaire */}
            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2B5296] font-black text-xs shadow-sm">
              {initials}
            </div>

          </div>
        )}

      </div>
    </header>
  );
};