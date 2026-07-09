import { useState, useRef, useEffect } from 'react';
import { useSurgeryHistory, useCreateSurgery, useDeleteSurgery } from '../features/surgery-history/hooks/useSurgery';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { surgeryService } from '../features/surgery-history/api/surgeryService';
import { 
  IconScissors, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconBuildingHospital, IconStethoscope, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen,
  IconLock 
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorSurgeryHistory } from '../features/surgery-history/hooks/useSurgery';
import { useAuthStore } from '../store/useAuthStore';

export const SurgeryHistoryPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const location = useLocation();
  const isDonorMode = location.pathname.startsWith('/donors');
  const { data : donors } = useDonors();

  const subjects = isDonorMode ? donors : patients;

  const { user } = useAuthStore();
  const roleU = user?.roleU;

  const estInvestigateur = roleU === 'MEDECIN_INVESTIGATEUR';
  const estSuivi = roleU === 'MEDECIN_SUIVI';

  const aAccesPage = estInvestigateur || estSuivi;
  
  const isReadOnly = estSuivi; 

  if (!aAccesPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12 text-xs">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          Le registre de l'historique chirurgical et des abords vasculaires est restreint exclusivement aux équipes médicales cliniques d'investigation et de suivi.
        </p>
      </div>
    );
  }
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: patientSurgery, isLoading: loadingPatientSurgeries } = useSurgeryHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorSurgery, isLoading: LoadingDonorSurgeries } = useDonorSurgeryHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const history = isDonorMode ? donorSurgery : patientSurgery;
  const loadingHistory = isDonorMode ? LoadingDonorSurgeries : loadingPatientSurgeries;

  const createMutation = useCreateSurgery();
  const deleteMutation = useDeleteSurgery(patientIdString);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const [intervention, setIntervention] = useState('');
  const [date, setDate] = useState('');
  const [lieu, setLieu] = useState('');
  const [chirurgien, setChirurgien] = useState('');
  const [evolution, setEvolution] = useState('');

  const [selectedSurgery, setSelectedSurgery] = useState<any | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const query = patientSearch.toLowerCase();
    
    return nomComplet.includes(query) || String(identifiant).toLowerCase().includes(query);
  });

  const filteredSurgeries = history?.filter(s => {
    const actStr = s.intervention?.toLowerCase() || '';
    const doctorStr = s.chirurgien?.toLowerCase() || '';
    const placeStr = s.lieu?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return actStr.includes(query) || doctorStr.includes(query) || placeStr.includes(query);
  }) || [];

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  const resetForm = () => {
    setSelectedSurgery(null);
    setIntervention('');
    setDate('');
    setLieu('');
    setChirurgien('');
    setEvolution('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !intervention || !date || isReadOnly) return; 

    const payload: any = {
      intervention,
      date,
      lieu: lieu || 'Non précisé',
      chirurgien: chirurgien || 'Non précisé',
      evolution,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (selectedSurgery) {
        await surgeryService.update(selectedSurgery.identifiantACH, payload);
        setToastMessage("Antécédent chirurgical mis à jour !");
      } else {
        if (isDonorMode) {
          await axios.post(`http://localhost:8081/api/antecedents-chirurgicaux/donneur/${selectedPatientId}`, payload);
        } else {
          await createMutation.mutateAsync({ patientId: patientIdString, data: payload });
        }
        setToastMessage("Intervention chirurgicale enregistrée !");
      }

      setToastType('success');
      setToastOpen(true);
      
      queryClient.invalidateQueries({ queryKey: ['surgeryHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorSurgeryHistory'] });
      queryClient.invalidateQueries({ queryKey: ['surgery-history'] });
      
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (surgery: any) => {
    if (isReadOnly) return;
    setSelectedSurgery(surgery);
    setIntervention(surgery.intervention);
    setDate(surgery.date);
    setLieu(surgery.lieu);
    setChirurgien(surgery.chirurgien || '');
    setEvolution(surgery.evolution);
  };

  const triggerDelete = (id: number) => {
    if (isReadOnly) return;
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null || isReadOnly) return;
    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/antecedents-chirurgicaux/${idToDelete}`);
      } else {
        await deleteMutation.mutateAsync(idToDelete);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Antécédent chirurgical supprimé.");
      setToastOpen(true);
      
      queryClient.invalidateQueries({ queryKey: ['surgeryHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorSurgeryHistory'] });
      queryClient.invalidateQueries({ queryKey: ['surgery-history'] });
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur de suppression.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = history || [];
      filename = `export_ant_chirurgicaux_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await surgeryService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_ant_chirurgicaux_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun antécédent chirurgical à exporter.");
      return;
    }

    const headers = ["identifiantACH", "patientId", "intervention", "date", "lieu", "chirurgien", "evolution"];
    const csvRows = datasetToExport.map(ac => [
      ac.identifiantACH || "",
      ac.patientId || ac.patient?.identifiantP || "",
      `"${String(ac.intervention || '').replace(/"/g, '""')}"`,
      ac.date || "",
      `"${String(ac.lieu || '').replace(/"/g, '""')}"`,
      `"${String(ac.chirurgien || '').replace(/"/g, '""')}"`,
      `"${String(ac.evolution || '').replace(/"/g, '""')}"`
    ].join(";"));

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = (mode: 'global' | 'personal') => {
    const headers = mode === 'global' 
      ? ["patientId", "intervention", "date", "lieu", "chirurgien", "evolution"]
      : ["intervention", "date", "lieu", "chirurgien", "evolution"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_ant_chirurgicaux_global.csv" : "modele_import_ant_chirurgicaux_personnel.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
      const separator = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(separator).map(h => h.trim());
      
      const parsedData = lines.slice(1).map(line => {
        const values = line.split(separator);
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index]?.trim() || '';
          return obj;
        }, {});
      });
      setPreviewData(parsedData);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportSubmit = async () => {
    if (previewData.length === 0 || isReadOnly) return; 
    setIsProcessing(true);
    let successCount = 0;

    for (const row of previewData) {
      try {
        const payload = {
          intervention: row.intervention,
          date: row.date,
          lieu: row.lieu || 'Non précisé',
          chirurgien: row.chirurgien || 'Non précisé',
          evolution: row.evolution || 'Favorable'
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await surgeryService.create(targetPatientId, payload);
          successCount++;
        }
      } catch (err) {
        console.error("Erreur d'import :", err);
      }
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    
    setToastMessage(`${successCount} antécédent(s) chirurgical(aux) importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['surgeryHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorSurgeryHistory'] });
    queryClient.invalidateQueries({ queryKey: ['surgery-history'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Registre Chirurgical {isDonorMode ? 'Donneur' : 'Patient'}
          </h2>
          
          {!selectedPatientId && (
            <div className="flex gap-2">
              {!isReadOnly && (
                <button 
                  onClick={() => { setImportMode('global'); setIsImportOpen(true); }}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <IconDatabaseImport size={16} /> Import de Cohorte
                </button>
              )}
              <button 
                onClick={() => handleExportCSV('global')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <IconFileSpreadsheet size={16} /> Export de Cohorte
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
              placeholder={isDonorMode ? "Rechercher un donneur par nom ou par ID..." : "Rechercher par nom ou par ID de patient..."}
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const found = subjects?.find(p => {
                    const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                    const prenom = isDonorMode ? p.prenomD : p.prenomP;
                    const nom = isDonorMode ? p.nomD : p.nomP;
                    return String(idSujet) === patientSearch || 
                           `${prenom} ${nom}`.toLowerCase() === patientSearch.toLowerCase();
                  });
                  if (found) {
                    setSelectedPatientId(isDonorMode ? found.identifiantD! : found.identifiantP!);
                    setPatientSearch('');
                    setLocalSearchTerm('');
                  }
                }
              }}
            />
            {patientSearch && filteredPatients && filteredPatients.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y">
                {filteredPatients.map(p => {
                  const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                  const prenom = isDonorMode ? p.prenomD : p.prenomP;
                  const nom = isDonorMode ? p.nomD : p.nomP;
                  return (
                    <div key={idSujet} onClick={() => { setSelectedPatientId(idSujet); setPatientSearch(''); }} className="p-3 text-xs font-semibold hover:bg-blue-50 text-slate-800 cursor-pointer flex justify-between">
                      <span>{prenom} {nom}</span>
                      <span className="text-[#6588BB]">ID : {idSujet}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#2B5296]">
                {isDonorMode ? 'Donneur' : 'Patient'} : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`}
              </span>
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                Fermer le dossier
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">
              {isDonorMode ? "Votre cohorte de donneurs" : "Votre cohorte d'interventions chirurgicales"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5">
              {isDonorMode 
                ? "Ouvrez le dossier d'un donneur pour enregistrer ses actes chirurgicaux pré-existants."
                : "Ouvrez le dossier d'un patient pour enregistrer ses actes chirurgicaux pré-existants."}
            </p>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((p) => {
                const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                const prenom = isDonorMode ? p.prenomD : p.prenomP;
                const nom = isDonorMode ? p.nomD : p.nomP;
                const cin = isDonorMode ? p.cinD : p.numeroCin;
                return (
                  <div 
                    key={idSujet}
                    onClick={() => { setSelectedPatientId(idSujet); setLocalSearchTerm(''); }}
                    className="border border-slate-100 hover:border-[#2B5296]/50 bg-[#F8FAFC]/50 hover:bg-blue-50/10 p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {prenom} {nom}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">ID : {idSujet}</p>
                      <p className="text-[10px] text-[#6588BB] font-semibold mt-1">
                        CIN : {cin || 'N/A'}
                      </p>
                    </div>
                    <IconFolderOpen size={20} className="text-[#2B5296]" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <IconAlertCircle size={40} className="text-slate-300 mb-3" />
              <p className="font-semibold">Aucun dossier actif rattaché à votre profil.</p>
            </div>
          )}
        </div>
      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {!isReadOnly && (
            <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
              <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
                <IconPlus size={20} /> {selectedSurgery ? "Modifier la Chirurgie" : "Saisir une Chirurgie"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type d'intervention *</label>
                  <input type="text" value={intervention} onChange={(e) => setIntervention(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date de l'opération *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu</label>
                  <input type="text" value={lieu} onChange={(e) => setLieu(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" placeholder="Ex: CHN" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Médecin Chirurgien</label>
                  <input type="text" value={chirurgien} onChange={(e) => setChirurgien(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" placeholder="Nom du chirurgien" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Évolution *</label>
                  <input 
                      type="text"
                      value={evolution} 
                      onChange={(e) => setEvolution(e.target.value)} 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none" 
                      placeholder=""
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedSurgery && (
                    <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                  )}
                  <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                    {selectedSurgery ? "Sauvegarder" : "Enregistrer la Chirurgie"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between`}>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconScissors size={22} className="text-[#2B5296]" />
                    Registre Historique des Opérations Chirurgicales ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par acte ou lieu..." 
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                  </div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => { setImportMode('personal'); setIsImportOpen(true); }}
                      className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                      title="Importer pour ce patient"
                    >
                      <IconDatabaseImport size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleExportCSV('personal')}
                    className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Exporter cet historique"
                  >
                    <IconFileSpreadsheet size={16} />
                  </button>
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredSurgeries && filteredSurgeries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSurgeries.map((s) => (
                    <div key={s.identifiantACH} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase truncate max-w-[200px]">
                            {s.intervention}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.evolution === 'Favorable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            Évolution : {s.evolution}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          <p className="flex items-center gap-1.5"><IconCalendar size={14} /> Opéré(e) le : <strong>{s.date}</strong></p>
                          <p className="flex items-center gap-1.5"><IconBuildingHospital size={14} /> Lieu : <strong>{s.lieu}</strong></p>
                          <p className="flex items-center gap-1.5"><IconStethoscope size={14} /> Chirurgien : <strong>Dr. {s.chirurgien || 'Non précisé'}</strong></p>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                          <button onClick={() => triggerEdit(s)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={14} /></button>
                          <button onClick={() => triggerDelete(s.identifiantACH!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun antécédent chirurgical enregistré ne correspond à vos filtres.</p>
                </div>
              )}
            </div>

            {isReadOnly && (
              <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
                * Consultation : Vous disposez d'un accès en lecture seule sur cette fiche.
              </div>
            )}
          </div>

        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-[#2B5296]">
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer l'historique chirurgical de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
              </h2>
              <button onClick={() => { setIsImportOpen(false); setFile(null); setPreviewData([]); }} className="border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-slate-100 text-slate-400"><IconX size={20} /></button>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[20px] p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
              <IconFileSpreadsheet className="mx-auto text-[#006591] mb-4" size={32} />
              <p className="font-bold text-slate-500 uppercase">Sélectionner fichier .CSV</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            </div>

            {importFile && (
              <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#2B5296] truncate max-w-[250px]">
                    {importFile.name}
                  </span>
                  <span className="text-[10px] font-bold bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full border border-emerald-100">
                    {previewData.length} lignes détectées
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => handleDownloadTemplate(importMode)} 
                className="flex-1 bg-white border border-[#2B5296] text-[#2B5296] py-3 rounded-xl font-bold text-xs hover:bg-[#2B5296]/5 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <IconDownload size={16} /> Modèle de saisie
              </button>

              <button 
                type="button" 
                onClick={handleImportSubmit} 
                disabled={isProcessing || !importFile} 
                className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-[#1a386b] cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? <IconLoader className="animate-spin" size={16} /> : "Lancer l'importation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la chirurgie ?" message="Cette action effacera définitivement cette opération du registre clinique." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};