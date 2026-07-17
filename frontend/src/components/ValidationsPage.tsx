import { useState } from 'react';
import { usePendingUsers, useAllUsers, useToggleUserStatus, PendingUser } from '../features/validations/hooks/useValidations';
import { 
  IconSearch, 
  IconUserCheck, 
  IconUserX, 
  IconMail, 
  IconId, 
  IconShieldLock, 
  IconCheck,
  IconLock,
  IconLoader
} from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from './ui/Toast';

export const ValidationsPage = () => {
  const { user } = useAuthStore();
  const isSystemAdmin = user?.roleU === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  const { data: pendingUsers, isLoading: loadingPending } = usePendingUsers();
  const { data: allUsers, isLoading: loadingAll } = useAllUsers();
  const toggleStatusMutation = useToggleUserStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<PendingUser | null>(null);

  const handleActionClick = (u: PendingUser) => {
    setTargetUser(u);
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    
    try {
      await toggleStatusMutation.mutateAsync(targetUser.uuid);
      setToastType('success');
      setToastMessage(
        targetUser.active 
          ? `L'accès de ${targetUser.loginU} a été suspendu.` 
          : `Le compte de ${targetUser.loginU} est maintenant actif !`
      );
      setToastOpen(true);
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Une erreur est survenue lors de l'opération.");
      setToastOpen(true);
    } finally {
      setConfirmOpen(false);
      setTargetUser(null);
    }
  };

  const activeUsers = allUsers?.filter(u => u.active && u.loginU !== 'admin');

  const currentList = activeTab === 'pending' ? pendingUsers : activeUsers;

  const filteredUsers = currentList?.filter(u => {
    const loginClean = u.loginU.toLowerCase();
    const emailClean = u.emailU?.toLowerCase() || '';
    
    const matriculeClean = u.medecinId ? String(u.medecinId) : '';
    
    const searchClean = searchTerm.toLowerCase();

    const matchMatricule = matriculeClean.includes(searchClean) || 
                           ("0" + matriculeClean).includes(searchClean);

    return loginClean.includes(searchClean) || 
           emailClean.includes(searchClean) || 
           matchMatricule;
  });

  if (!isSystemAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Administrateur Requis</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          Cette section contient des outils de contrôle système. Seul l'administrateur de la plateforme est habilité à valider les accès cliniques.
        </p>
      </div>
    );
  }

  if (loadingPending || loadingAll) return <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-b-2 border-[#2B5296] rounded-full"></div></div>;

  return (
    <div className="max-w-[1440px] mx-auto p-6 text-xs">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Accès Cliniques</h1>
          <p className="text-[#6588BB] text-sm">Piloter la validation et l'activation des comptes utilisateurs.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
            placeholder="Rechercher par identifiant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex border-b border-slate-100 pb-2 mb-6">
        <button 
          type="button" 
          onClick={() => { setActiveTab('pending'); setSearchTerm(''); }} 
          className={`pb-2 px-6 text-xs font-bold border-none bg-transparent cursor-pointer transition-colors ${activeTab === 'pending' ? 'text-[#2B5296] border-b-2 border-[#2B5296]' : 'text-slate-400'}`}
        >
          En attente de validation ({pendingUsers?.length || 0})
        </button>
        <button 
          type="button" 
          onClick={() => { setActiveTab('active'); setSearchTerm(''); }} 
          className={`pb-2 px-6 text-xs font-bold border-none bg-transparent cursor-pointer transition-colors ${activeTab === 'active' ? 'text-[#2B5296] border-b-2 border-[#2B5296]' : 'text-slate-400'}`}
        >
          Utilisateurs Actifs ({activeUsers?.length || 0})
        </button>
      </div>

      {filteredUsers?.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-[30px] shadow-sm max-w-md mx-auto mt-6 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <IconCheck size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Aucun compte dans cette section</h3>
          <p className="text-[#6588BB] text-xs leading-relaxed">
            La liste des utilisateurs sélectionnés est actuellement vide ou aucun résultat ne correspond à votre recherche.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers?.map((u) => (
          <div key={u.uuid} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                  u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'
                }`}>
                  <IconShieldLock size={24} />
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                }`}>
                  {u.active ? 'Actif' : 'En attente'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">{u.loginU}</h3>
              <p className="text-[10px] text-[#6588BB] font-black uppercase tracking-wider mb-4">
                Rôle : {u.roleU?.replace('ROLE_', '').replace('_', ' ')}
              </p>

              <div className="space-y-2 border-t pt-4 text-xs text-slate-600">
                <p className="flex items-center gap-2 font-semibold">
                  <IconMail size={16} className="text-slate-400" /> {u.emailU}
                </p>
                {u.medecinId && (
                  <p className="flex items-center gap-2 font-mono">
                    <IconId size={16} className="text-slate-400" /> Matricule: {u.medecinId}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              {u.active ? (
                <button 
                  onClick={() => handleActionClick(u)}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-2 border-none cursor-pointer transition-colors"
                >
                  <IconUserX size={16} /> Suspendre l'accès clinique
                </button>
              ) : (
                <button 
                  onClick={() => handleActionClick(u)}
                  className="w-full bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 flex items-center justify-center gap-2 border-none cursor-pointer shadow-md shadow-[#2B5296]/10 transition-colors"
                >
                  <IconUserCheck size={16} /> Activer le compte clinique
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {confirmOpen && targetUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 max-w-sm w-full shadow-2xl space-y-4 text-xs">
            <div className="text-center text-[#2B5296]">
              {targetUser.active ? (
                <IconUserX size={40} className="mx-auto mb-2 text-red-500" />
              ) : (
                <IconUserCheck size={40} className="mx-auto mb-2 text-[#2B5296]" />
              )}
              <h3 className="text-base font-bold text-slate-900">
                {targetUser.active ? "Suspendre l'accès ?" : "Activer ce compte ?"}
              </h3>
            </div>
            <p className="text-slate-500 text-center leading-relaxed font-semibold">
              {targetUser.active ? (
                <>Voulez-vous suspendre l'accès clinique de <strong className="text-slate-800">{targetUser.loginU}</strong> ? Il ne pourra plus se connecter et recevra un email de notification.</>
              ) : (
                <>Voulez-vous autoriser le compte de <strong className="text-slate-800">{targetUser.loginU}</strong> à accéder à la plateforme ? Un email d'activation lui sera envoyé.</>
              )}
            </p>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => { setConfirmOpen(false); setTargetUser(null); }} 
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border-none cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={handleConfirmToggle} 
                disabled={toggleStatusMutation.isPending}
                className={`flex-1 py-3 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-1 text-white ${
                  targetUser.active ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2B5296] hover:bg-blue-900'
                }`}
              >
                {toggleStatusMutation.isPending ? <IconLoader className="animate-spin" size={16} /> : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};