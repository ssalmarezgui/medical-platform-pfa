import { useState, useRef, useEffect } from 'react';
import { useMedicationHistory, useCreateMedication, useDeleteMedication } from '../features/medications/hooks/useMedications';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../features/medications/api/medicationService';
import { 
  IconPill, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconReportMedical, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorMedicationHistory } from '../features/medications/hooks/useMedications';
import { usePermission } from '../hooks/usePermission'; 
import { useAuthStore } from '../store/useAuthStore';

export const MedicationHistoryPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const { hasPermission } = usePermission();
  const userRole = useAuthStore((state) => state.role);

  const canAccess = hasPermission('READ_PATIENT') || hasPermission('READ_DONNEUR') || hasPermission('WRITE_PATIENT') || hasPermission('WRITE_DONNEUR');
  const isReadOnly = (!hasPermission('WRITE_PATIENT') && !hasPermission('WRITE_DONNEUR')) || userRole === 'ADMIN';

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter l'historique des médicaments long cours.
      </div>
    );
  }

  const location = useLocation();
  const isDonorMode = location.pathname.startsWith('/donors');
  const { data : donors } = useDonors();
  
  const subjects = isDonorMode ? donors : patients;

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: patientMedications, isLoading: loadingPatientMeds } = useMedicationHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorMedications, isLoading: loadingDonorMeds } = useDonorMedicationHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const medications = isDonorMode ? donorMedications : patientMedications;
  const loadingMeds = isDonorMode ? loadingDonorMeds : loadingPatientMeds;

  const createMutation = useCreateMedication();
  const deleteMutation = useDeleteMedication(patientIdString);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const categoriesPapier = [
    "Corticoïdes",
    "Immunosuppresseurs",
    "Antalgiques",
    "Anti-inflammatoires",
    "Antibiotiques",
    "Anticoagulants",
    "Antiagrégants plaquettaires",
    "Neuroleptiques",
    "Autres"
  ];

  const [libelleMLC, setLibelleMLC] = useState(categoriesPapier[0]);
  const [molecule, setMolecule] = useState('');
  const [indication, setIndication] = useState('');
  const [debutTraitement, setDebutTraitement] = useState('');

  const [selectedMed, setSelectedMed] = useState<any | null>(null);

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

  const filteredMeds = medications?.filter(m => {
    const catStr = m.libelleMLC?.toLowerCase() || '';
    const molStr = m.molecule?.toLowerCase() || '';
    const indStr = m.indication?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return catStr.includes(query) || molStr.includes(query) || indStr.includes(query);
  }) || [];

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  const resetForm = () => {
    setSelectedMed(null);
    setMolecule('');
    setIndication('');
    setDebutTraitement('');
    setLibelleMLC(categoriesPapier[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !molecule || !indication) return;

    const payload: any = {
      libelleMLC,
      molecule,
      indication,
      debutTraitement: debutTraitement || undefined,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (selectedMed) {
        await medicationService.update(selectedMed.identifiantMLC, payload);
        setToastMessage("Traitement habituel mis à jour !");
      } else {
        if (isDonorMode) {
          await axios.post(`http://localhost:8081/api/medicaments-long-cours/donneur/${selectedPatientId}`, payload);
        } else {
          await createMutation.mutateAsync({ patientId: patientIdString, data: payload });
        }
        setToastMessage("Nouveau traitement enregistré !");
      }

      setToastType('success');
      setToastOpen(true);
      
      queryClient.invalidateQueries({ queryKey: ['medicationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorMedicationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['medication-history'] });

      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (med: any) => {
    setSelectedMed(med);
    setLibelleMLC(med.libelleMLC);
    setMolecule(med.molecule);
    setIndication(med.indication);
    setDebutTraitement(med.debutTraitement || '');
  };

  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/medicaments-long-cours/${idToDelete}`);
      } else {
        await deleteMutation.mutateAsync(idToDelete);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Traitement supprimé du registre.");
      setToastOpen(true);

      queryClient.invalidateQueries({ queryKey: ['medicationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorMedicationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['medication-history'] });
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
      datasetToExport = medications || [];
      filename = `export_traitements_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await medicationService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_traitements_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun traitement à exporter.");
      return;
    }

    const headers = ["identifiantMLC", "patientId", "libelleMLC", "molecule", "indication", "debutTraitement"];
    const csvRows = datasetToExport.map(mlc => [
      mlc.identifiantMLC || "",
      mlc.patientId || mlc.patient?.identifiantP || "",
      `"${String(mlc.libelleMLC || '').replace(/"/g, '""')}"`,
      `"${String(mlc.molecule || '').replace(/"/g, '""')}"`,
      `"${String(mlc.indication || '').replace(/"/g, '""')}"`,
      mlc.debutTraitement || ""
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
      ? ["patientId", "libelleMLC", "molecule", "indication", "debutTraitement"]
      : ["libelleMLC", "molecule", "indication", "debutTraitement"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_traitements_global.csv" : "modele_import_traitements_personnel.csv";
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
    if (previewData.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;

    for (const row of previewData) {
      try {
        const payload = {
          libelleMLC: row.libelleMLC,
          molecule: row.molecule,
          indication: row.indication,
          debutTraitement: row.debutTraitement || undefined
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await medicationService.create(targetPatientId, payload);
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
    
    setToastMessage(`${successCount} traitement(s) habituel(s) importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['medicationHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorMedicationHistory'] });
    queryClient.invalidateQueries({ queryKey: ['medication-history'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Registre des Médicaments Habituels
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
              {isDonorMode ? "Votre cohorte thérapeutique (Donneurs)" : "Votre cohorte thérapeutique (Patients)"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5">
              {isDonorMode 
                ? "Ouvrez le dossier d'un donneur pour lui prescrire ou enregistrer ses traitements de fond habituels."
                : "Ouvrez le dossier d'un patient pour lui prescrire ou enregistrer ses traitements de fond habituels."}
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
                <IconPlus size={20} /> {selectedMed ? "Modifier le Traitement" : "Saisir un Traitement"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Catégorie de molécule *</label>
                  <select value={libelleMLC} onChange={(e) => setLibelleMLC(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                    {categoriesPapier.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Molécule(s) *</label>
                  <input type="text" value={molecule} onChange={(e) => setMolecule(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Indication *</label>
                  <input type="text" value={indication} onChange={(e) => setIndication(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Début du traitement</label>
                  <input type="date" value={debutTraitement} onChange={(e) => setDebutTraitement(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedMed && (
                    <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                  )}
                  <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                    {selectedMed ? "Sauvegarder" : "Enregistrer le Traitement"}
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
                    <IconPill size={22} className="text-[#2B5296]" />
                    Traitements Médicamenteux ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par molécule ou indication..." 
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

              {loadingMeds ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredMeds && filteredMeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMeds.map((m) => (
                    <div key={m.identifiantMLC} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase truncate max-w-[200px]">
                            {m.libelleMLC}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                          <IconPill size={16} className="text-[#6588BB]" />
                          {m.molecule}
                        </h4>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          <p className="flex items-center gap-1.5"><IconReportMedical size={14} /> Indication : <strong>{m.indication}</strong></p>
                          {m.debutTraitement && (
                            <p className="flex items-center gap-1.5"><IconCalendar size={14} /> Débuté le : <strong>{m.debutTraitement}</strong></p>
                          )}
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                          <button onClick={() => triggerEdit(m)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={16} /></button>
                          <button onClick={() => triggerDelete(m.identifiantMLC!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun traitement enregistré ne correspond à vos filtres.</p>
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
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer les traitements de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer le traitement ?" message="Cette action retirera définitivement cette ligne thérapeutique." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};