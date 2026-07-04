import { 
  IconBuildingHospital, 
  IconStethoscope,
  IconHeartbeat,      
  IconPill,           
  IconX,
  IconLogout,
  IconUsersGroup
} from '@tabler/icons-react';
import React, { useState } from 'react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const queryClient = useQueryClient();

  const handleConfirmLogout = () => {
    queryClient.clear(); 
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const isSystemAdmin = user?.roleU === 'ADMIN';
  const isInvestigateur = user?.roleU === 'MEDECIN_INVESTIGATEUR';
  const isAgentLabo = user?.roleU === 'AGENT_LABORATOIRE';
  const isAgentImmuno = user?.roleU === 'AGENT_IMMUNO';
  const isMedecinSuivi = user?.roleU === 'MEDECIN_SUIVI';

  return (
    <>
      <aside className="h-screen w-[260px] bg-[#F8FAFC] border-r border-slate-200 flex flex-col justify-between shrink-0">
        
        <div>
          <div className="p-6 mb-2 flex justify-between items-start">
            <div>
              <h1 className="text-[#2B5296] font-bold text-xl">MedPlatform</h1>
              <p className="text-[10px] font-bold text-[#6588BB] uppercase tracking-[0.15em] mt-1">
                {user?.roleU?.replace('_', ' ')}
              </p>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 hover:bg-[#E2E8F0]/60 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer transition-colors duration-200"
            >
              <IconX size={18} />
            </button>
          </div>

          <nav className="mt-4 px-2 space-y-4">
            
            {(isInvestigateur || isMedecinSuivi || isAgentLabo) && (
              <div className="space-y-1.5">
                <div className="px-4 pb-1">
                  <p className="text-[9px] font-black text-[#6588BB] uppercase tracking-[0.2em]">Receveurs</p>
                </div>
                {(isInvestigateur || isMedecinSuivi) && (
                  <NavItem 
                    icon={<IconUsersGroup size={20} />} 
                    label="Registre Patients" 
                    path="/patients" 
                    active={location.pathname === '/patients'} 
                  />
                )}
                {(isInvestigateur || isAgentLabo) && (
                  <NavItem 
                    icon={<IconStethoscope size={20} />} 
                    label="Bilan pré-greffe" 
                    path="/diagnostic-hub" 
                    active={location.pathname === '/diagnostic-hub'} 
                  />
                )}
              </div>
            )}

            {(isInvestigateur || isMedecinSuivi || isAgentLabo) && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="px-4 pb-1">
                  <p className="text-[9px] font-black text-[#6588BB] uppercase tracking-[0.2em]">Donneurs d'Organes</p>
                </div>
                {(isInvestigateur || isMedecinSuivi) && (
                  <NavItem 
                    icon={<IconUsersGroup size={20} />} 
                    label="Registre Donneurs" 
                    path="/donors" 
                    active={location.pathname === '/donors'} 
                  />
                )}
                {(isInvestigateur || isAgentLabo) && (
                  <NavItem 
                    icon={<IconStethoscope size={20} />} 
                    label="Bilans Donneurs" 
                    path="/diagnostic-donor-hub" 
                    active={location.pathname === '/diagnostic-donor-hub'} 
                  />
                )}
              </div>
            )}

            {(isSystemAdmin || isMedecinSuivi || isAgentImmuno) && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="px-4 pb-1">
                  <p className="text-[9px] font-black text-[#6588BB] uppercase tracking-[0.2em]">Suivi & Thérapeutique</p>
                </div>
                {isSystemAdmin && (
                  <NavItem 
                    icon={<IconBuildingHospital size={20} />} 
                    label="Hospitalisation" 
                    path="/hospitalisation-hub" 
                    active={location.pathname === '/hospitalisation-hub'} 
                  />
                )}
                {isMedecinSuivi && (
                  <NavItem 
                    icon={<IconHeartbeat size={20} />} 
                    label="Transplantations" 
                    path="/transplantations-hub" 
                    active={location.pathname === '/transplantations-hub'} 
                  />
                )}
                {(isAgentImmuno || isMedecinSuivi) && (
                  <NavItem 
                    icon={<IconPill size={20} />} 
                    label="Immuno-suppresseurs" 
                    path="/immuno-treatments" 
                    active={location.pathname === '/immuno-treatments'} 
                  />
                )}
                
                {(isSystemAdmin || isMedecinSuivi) && (
                  <NavItem 
                    icon={<IconPill size={20} />} 
                    label="Catalogue Molécules" 
                    path="/medicaments-catalog" 
                    active={location.pathname === '/medicaments-catalog'} 
                  />
                )}
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold border-none cursor-pointer transition-colors"
          >
            <IconLogout size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider">Déconnexion</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 max-w-sm w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="text-center text-[#2B5296]">
              <IconLogout size={40} className="mx-auto mb-2 text-red-500" />
              <h3 className="text-base font-bold text-slate-900">Confirmer la déconnexion ?</h3>
            </div>
            <p className="text-slate-500 text-center leading-relaxed font-semibold">
              Êtes-vous sûr de vouloir fermer votre session clinique sécurisée ? Toutes les modifications non enregistrées seront perdues.
            </p>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border-none cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={handleConfirmLogout} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold border-none cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavItem = ({ icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link 
    to={path} 
    className={`
      flex items-center 
      gap-4 
      px-5 py-3.5 
      mx-3 
      rounded-xl 
      cursor-pointer 
      transition-all duration-200 
      no-underline
      ${active 
        ? 'bg-[#2B5296] !text-white shadow-lg shadow-[#2B5296]/20' 
        : 'text-[#6588BB] hover:bg-[#E2E8F0]/50 hover:text-[#2B5296]'}
    `}
    style={{ textDecoration: 'none' }}
  >
    <span className={`transition-colors duration-200 flex items-center ${active ? '!text-white' : 'text-[#2B5296]'}`}>
       {React.cloneElement(icon, { size: 20 })}
    </span>
    
    <span className={`text-[11px] font-black uppercase tracking-wider whitespace-nowrap 
      ${active ? '!text-white' : 'text-[#6588BB]'}`}>
      {label}
    </span>
  </Link>
);