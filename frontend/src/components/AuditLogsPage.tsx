import { useState } from 'react';
import { useAuditLogs } from '../features/admin/hooks/useAuditLogs';
import { useAuthStore } from '../store/useAuthStore';
import { 
  IconSearch, 
  IconFileSpreadsheet, 
  IconLock,
  IconClock,
  IconHistory
} from '@tabler/icons-react';

export const AuditLogsPage = () => {
  const { user } = useAuthStore();
  const isSystemAdmin = user?.roleU === 'ADMIN';

  const { data: logs, isLoading } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Bouton d'exportation au format CSV (Excel)
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const headers = ["Date", "Utilisateur", "Rôle", "Action", "Cible", "Description"];

    const csvRows = logs.map(log => {
      const formattedDate = new Date(log.timestamp).toLocaleString('fr-FR');
      return [
        `"${formattedDate}"`,
        `"${log.username}"`,
        `"${log.role.replace('ROLE_', '')}"`,
        `"${log.action}"`,
        `"${log.target.replace(/"/g, '""')}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(";");
    });

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `journal_activite_medplatform_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtrer les logs selon la recherche (sur l'utilisateur, l'action, ou la cible)
  const filteredLogs = logs?.filter(log => {
    const searchClean = searchTerm.toLowerCase();
    return (
      log.username.toLowerCase().includes(searchClean) ||
      log.action.toLowerCase().includes(searchClean) ||
      log.target.toLowerCase().includes(searchClean)
    );
  });

  // Fonction utilitaire pour attribuer une couleur selon l'action
  const getActionBadgeColor = (action: string) => {
    if (action.includes('ECHEC') || action.includes('BLOQUEE') || action.includes('SUSPENSION')) {
      return 'bg-red-50 text-red-600 border border-red-100';
    }
    if (action.includes('REUSSITE') || action.includes('VALIDATION') || action.includes('ACTIVATION')) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
    if (action.includes('INSCRIPTION') || action.includes('DEMANDE')) {
      return 'bg-blue-50 text-[#2B5296] border border-blue-100';
    }
    return 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  // Contrôle d'accès : Seul l'admin a le droit de voir cette page de logs
  if (!isSystemAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          Le journal d'activité système contient des données d'accès confidentielles. Pour des raisons d'audit et de sécurité, sa consultation est restreinte à l'administrateur.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-b-2 border-[#2B5296] rounded-full"></div></div>;

  return (
    <div className="max-w-[1440px] mx-auto p-6 text-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Journal d'Activité Système</h1>
          <p className="text-[#6588BB] text-sm">Registre d'audit et de traçabilité en temps réel (Conformité RGPD / HDS).</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Recherche */}
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
              placeholder="Rechercher un log..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Bouton Télécharger */}
          <button 
            onClick={handleExportCSV} 
            title="Télécharger les logs (CSV)"
            className="p-3 bg-white border border-slate-200 text-[#2B5296] hover:bg-[#2B5296] hover:text-white rounded-xl cursor-pointer transition-all flex items-center gap-2 font-bold"
          >
            <IconFileSpreadsheet size={18} />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider">Télécharger (Excel)</span>
          </button>
        </div>
      </div>

      {/* Table des Logs */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Date & Heure</th>
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Utilisateur</th>
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Rôle</th>
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Type d'Action</th>
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Cible</th>
                <th className="p-4 text-[10px] font-black text-[#6588BB] uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Date */}
                  <td className="p-4 whitespace-nowrap font-semibold flex items-center gap-2 text-slate-500">
                    <IconClock size={16} />
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                  {/* Utilisateur */}
                  <td className="p-4 whitespace-nowrap font-bold text-slate-800">
                    {log.username}
                  </td>
                  {/* Rôle */}
                  <td className="p-4 whitespace-nowrap font-black uppercase tracking-wider text-[9px] text-[#6588BB]">
                    {log.role.replace('ROLE_', '').replace('_', ' ')}
                  </td>
                  {/* Badge d'action */}
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  {/* Cible */}
                  <td className="p-4 font-semibold text-[#2B5296]">
                    {log.target}
                  </td>
                  {/* Description */}
                  <td className="p-4 text-slate-500 max-w-xs truncate font-medium" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};