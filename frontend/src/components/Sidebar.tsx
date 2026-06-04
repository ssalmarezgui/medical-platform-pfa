import { IconLayoutDashboard, IconHospital, IconBuildingHospital, IconStethoscope, IconUserHeart, IconX } from '@tabler/icons-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';

export const Sidebar = () => {
  const location = useLocation();
  const { toggleSidebar } = useUIStore();

  return (
    <aside className="h-screen w-[260px] bg-[#F8FAFC] border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 mb-2 flex justify-between items-start">
        <div>
          <h1 className="text-[#2B5296] font-bold text-xl">MedPlatform</h1>
          <p className="text-[10px] font-bold text-[#6588BB] uppercase tracking-[0.15em] mt-1">
            Admin Console
          </p>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 hover:bg-[#E2E8F0]/60 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer transition-colors duration-200"
        >
          <IconX size={18} />
        </button>
      </div>

      <nav className="flex-1 mt-4 px-2 space-y-4 overflow-y-auto">
        <div className="space-y-1">
          <NavItem icon={<IconLayoutDashboard size={20} />} label="Tableau de bord" path="/dashboard" active={location.pathname === '/dashboard'} />
        </div>

        <div className="space-y-1">
          <p className="px-6 pb-2 text-[9px] font-black text-[#6588BB] uppercase tracking-[0.2em]">Répertoire</p>
          <div className="space-y-1.5">
            <NavItem icon={<IconHospital size={20} />} label="Hôpitaux" path="/hospitals" active={location.pathname === '/hospitals'} />
            <NavItem icon={<IconBuildingHospital size={20} />} label="Services" path="/services" active={location.pathname === '/services'} />
            <NavItem icon={<IconStethoscope size={20} />} label="Médecins" path="/doctors" active={location.pathname === '/doctors'} />
            <NavItem icon={<IconUserHeart size={20} />} label="Patients" path="/patients" active={location.pathname === '/patients'} />
          </div>
        </div>
      </nav>
    </aside>
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
      transition-all duration-300 
      no-underline
      ${active 
        ? 'bg-[#2B5296] !text-white shadow-lg shadow-[#2B5296]/20' 
        : 'text-[#6588BB] hover:bg-[#E2E8F0]/50 hover:text-[#2B5296]'}
    `}
    style={{ textDecoration: 'none' }}
  >
    <span className={`transition-colors duration-300 flex items-center ${active ? '!text-white' : 'text-[#2B5296]'}`}>
       {React.cloneElement(icon, { size: 20 })}
    </span>
    
    <span className={`text-[12px] font-bold uppercase tracking-wider whitespace-nowrap 
      ${active ? '!text-white' : 'text-[#6588BB]'}`}>
      {label}
    </span>
  </Link>
);