import { useAdminDashboardStats } from '../features/admin/hooks/useAdminDashboard';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { 
  IconPill, 
  IconBuildingHospital, 
  IconStethoscope, 
  IconUsersGroup, 
  IconShieldLock, 
  IconLock,
  IconArrowUpRight,
  IconCalendarEvent
} from '@tabler/icons-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSystemAdmin = user?.roleU === 'ADMIN';

  const { data: stats, isLoading } = useAdminDashboardStats();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!isSystemAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          Cette page d'accueil système est exclusivement réservée au compte de l'administrateur de la plateforme.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-b-2 border-[#2B5296] rounded-full"></div></div>;

  return (
    <div className="max-w-[1440px] mx-auto p-6 text-xs space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bonjour, Administrateur</h1>
          <p className="text-[#6588BB] text-sm mt-1">Voici l'état actuel de votre réseau hospitalier MedPlatform.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/50 text-[#2B5296] font-bold">
          <IconCalendarEvent size={18} />
          <span className="capitalize text-[11px] font-black uppercase tracking-wider">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Médecins Actifs</p>
            <h2 className="text-3xl font-bold text-slate-900">{stats?.activeDoctorsCount || 0}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2B5296] flex items-center justify-center">
            <IconStethoscope size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Demandes en attente</p>
            <h2 className="text-3xl font-bold text-slate-900">{stats?.pendingDoctorsCount || 0}</h2>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center z-10 ${
            (stats?.pendingDoctorsCount || 0) > 0 
              ? 'bg-orange-100 text-orange-600 animate-pulse' 
              : 'bg-slate-50 text-slate-400'
          }`}>
            <IconShieldLock size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Hôpitaux</p>
            <h2 className="text-3xl font-bold text-slate-900">{stats?.hospitalsCount || 0}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <IconBuildingHospital size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Pôles de soins</p>
            <h2 className="text-3xl font-bold text-slate-900">{stats?.servicesCount || 0}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <IconUsersGroup size={24} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Activité Opératoire</h3>
            <p className="text-[#6588BB] text-[11px] font-semibold">Nombre de transplantations effectuées les 7 derniers jours.</p>
          </div>
          <div className="h-[280px] w-full text-[10px] font-bold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.transplantsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }} />
                <Line 
                  type="monotone" 
                  dataKey="transplantCount" 
                  name="Transplantations" 
                  stroke="#2B5296" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Admissions par Établissement</h3>
            <p className="text-[#6588BB] text-[11px] font-semibold">Comparaison du volume de patients pris en charge par hôpital.</p>
          </div>
          <div className="h-[280px] w-full text-[10px] font-bold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.patientsPerHospital} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hospitalName" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }} />
                <Bar 
                  dataKey="patientCount" 
                  name="Nombre de Patients" 
                  fill="#006591" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Actions Rapides</h3>
          <p className="text-[#6588BB] text-[11px] font-semibold">Raccourcis vers les actions d'administration système.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button 
            onClick={() => navigate('/validations')}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 text-[#2B5296] border border-slate-100 hover:border-blue-100 rounded-2xl cursor-pointer text-left transition-all"
          >
            <span className="font-bold text-slate-800">Validation des Comptes</span>
            <IconArrowUpRight size={18} className="text-[#2B5296]" />
          </button>

          <button 
            onClick={() => navigate('/doctors')}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 text-[#2B5296] border border-slate-100 hover:border-blue-100 rounded-2xl cursor-pointer text-left transition-all"
          >
            <span className="font-bold text-slate-800">Ajouter un Médecin</span>
            <IconArrowUpRight size={18} className="text-[#2B5296]" />
          </button>

          <button 
            onClick={() => navigate('/hospitals')}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 text-[#2B5296] border border-slate-100 hover:border-blue-100 rounded-2xl cursor-pointer text-left transition-all"
          >
            <span className="font-bold text-slate-800">Gérer les Hôpitaux</span>
            <IconArrowUpRight size={18} className="text-[#2B5296]" />
          </button>

          <button 
            onClick={() => navigate('/patients')}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 text-[#2B5296] border border-slate-100 hover:border-blue-100 rounded-2xl cursor-pointer text-left transition-all"
          >
            <span className="font-bold text-slate-800">Registre Patients</span>
            <IconArrowUpRight size={18} className="text-[#2B5296]" />
          </button>

        </div>
      </div>

    </div>
  );
};