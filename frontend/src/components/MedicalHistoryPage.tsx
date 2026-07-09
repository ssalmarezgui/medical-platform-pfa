import { useState, useRef, useEffect } from 'react';
import { useMedicalHistory, useCreateMedical, useDeleteMedical } from '../features/medical-history/hooks/useMedical';
import { usePatients, useUpdatePatient } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { medicalService } from '../features/medical-history/api/medicalService';
import { 
  IconMedicalCross, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconEdit, IconNotes,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen,
  IconLock
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorMedicalHistory } from '../features/medical-history/hooks/useMedical';
import { useAuthStore } from '../store/useAuthStore';

export const MedicalHistoryPage = () => {
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
  const estAdmin = roleU === 'ADMIN';

  const aAccesPage = estInvestigateur || estSuivi || estAdmin;
  const isReadOnly = estSuivi || estAdmin;

  if (!aAccesPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12 text-xs">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          L'évaluation de l'autonomie et le recueil des antécédents médicaux d'admission sont réservés exclusivement aux praticiens cliniques autorisés.
        </p>
      </div>
    );
  }
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: patientHistory, isLoading: LoadingPatientHistory } = useMedicalHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorHistory, isLoading: LoadingDonorHistory } = useDonorMedicalHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const history = isDonorMode ? donorHistory : patientHistory;
  const loadingHistory = isDonorMode ? LoadingDonorHistory : LoadingPatientHistory;

  const createMutation = useCreateMedical();
  const deleteMutation = useDeleteMedical(patientIdString);
  const updatePatientMutation = useUpdatePatient();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const categories = [
    "Cardio-vasculaires",
    "Diabète sucré",
    "Bronchopneumopathie Chronique",
    "Hépathopathie",
    "Thromboses vasculaires",
    "Maladie Neurologique",
    "Maladie Gastro-intestinale",
    "Maladie / Trouble métabolique",
    "Infection COVID",
    "Autre"
  ];

  const [type, setType] = useState(categories[0]);
  const [sousType, setSousType] = useState('HTA');
  const [dateDebut, setDateDebut] = useState('');
  const [traitement, setTraitement] = useState('');
  const [evolution, setEvolution] = useState('');
  const [complication, setComplication] = useState('');
  
  const [typeLocalisation, setTypeLocalisation] = useState(''); 
  const [causeSiege, setCauseSiege] = useState(''); 
  const [lieuPriseEnCharge, setLieuPriseEnCharge] = useState(''); 

  const [diabeteType, setDiabeteType] = useState('Type 1');
  const [diabeteTraitement, setDiabeteTraitement] = useState('Aucun');
  const [diabeteComplications, setDiabeteComplications] = useState<string[]>([]);

  const [localAutonomie, setLocalAutonomie] = useState<string>('');

  const [selectedAM, setSelectedAM] = useState<any | null>(null);
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

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  useEffect(() => {
    if (selectedPatient) {
      setLocalAutonomie(selectedPatient.niveauEducation || '');
    } else {
      setLocalAutonomie('');
    }
  }, [selectedPatientId, selectedPatient?.niveauEducation]);

  useEffect(() => {
    if (type === 'Cardio-vasculaires') setSousType('HTA');
    else if (type === 'Diabète sucré') setSousType('Diabète');
    else if (type === 'Thromboses vasculaires') setSousType('Thrombose');
    else setSousType(type);
  }, [type]);
  

  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const query = patientSearch.toLowerCase();
    
    return nomComplet.includes(query) || String(identifiant).toLowerCase().includes(query);
  });

  const filteredMedicals = history?.filter(am => {
    const typeStr = am.type?.toLowerCase() || '';
    const sousTypeStr = am.sousType?.toLowerCase() || '';
    const traitementStr = am.traitement?.toLowerCase() || '';
    const compStr = am.complication?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return typeStr.includes(query) || sousTypeStr.includes(query) || traitementStr.includes(query) || compStr.includes(query);
  }) || [];

  const handleAutonomieChange = async (niveauSelected: string) => {
    if (!selectedPatientId || !selectedPatient || isReadOnly) return;

    setLocalAutonomie(niveauSelected);

    try {
      if (isDonorMode) {
        await axios.put(`http://localhost:8081/api/donneurs/${selectedPatientId}`, {
          ...selectedPatient,
          niveauEducation: niveauSelected
        });
        queryClient.invalidateQueries({ queryKey: ['donors'] });
      } else {
        await updatePatientMutation.mutateAsync({
          id: selectedPatientId,
          data: {
            ...selectedPatient,
            niveauEducation: niveauSelected
          }
        });
        queryClient.invalidateQueries({ queryKey: ['patients'] });
      }
      setToastType('success');
      setToastMessage(`Autonomie mise à jour : ${niveauSelected}`);
      setToastOpen(true);
    } catch {
      setLocalAutonomie(selectedPatient.niveauEducation || '');
      setToastType('error');
      setToastMessage("Erreur lors de la mise à jour de l'autonomie.");
      setToastOpen(true);
    }
  };

  const resetForm = () => {
    setSelectedAM(null);
    setDateDebut('');
    setTraitement('');
    setEvolution('');
    setComplication('');
    setTypeLocalisation('');
    setCauseSiege('');
    setLieuPriseEnCharge('');
    setDiabeteComplications([]);
    setType(categories[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || isReadOnly) return;

    let payload: any = {
      type,
      sousType,
      dateDebut: dateDebut || undefined,
      traitement: traitement || 'Non précisé',
      evolution: evolution || 'Non précisée',
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    if (type === 'Diabète sucré') {
      payload.sousType = `Diabète ${diabeteType}`;
      payload.traitement = `Traitement : ${diabeteTraitement}`;
      payload.complication = diabeteComplications.join(', ') || 'Aucune';
    } else if (sousType === 'HTA') {
      payload.complication = complication ? `${complication}` : 'Aucune';
    } else if (sousType === 'AVC' || sousType === 'Artériopathie MI') {
      payload.typeLocalisation = typeLocalisation;
    } else if (sousType === 'Amputation' || type === 'Thromboses vasculaires') {
      payload.causeSiege = causeSiege;
    } else if (['Hépathopathie', 'Maladie Neurologique', 'Maladie Gastro-intestinale', 'Maladie / Trouble métabolique'].includes(type)) {
      payload.lieuPriseEnCharge = lieuPriseEnCharge;
    }

    try {
      if (selectedAM) {
        await medicalService.update(selectedAM.identifiantAMed, payload);
        setToastMessage("Antécédent médical mis à jour !");
      } else {
        if (isDonorMode){
          await axios.post(`http://localhost:8081/api/antecedents-medicaux/donneur/${selectedPatientId}`, payload);
        } else {
          await createMutation.mutateAsync({ patientId: patientIdString, data: payload });
        }
        setToastMessage("Antécédent médical enregistré !");
      }

      setToastType('success');
      setToastOpen(true);

      queryClient.invalidateQueries({ queryKey: ['medicalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorMedicalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['medical-history'] });
      
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (am: any) => {
    if (isReadOnly) return;
    setSelectedAM(am);
    setType(am.type);
    setSousType(am.sousType);
    setDateDebut(am.dateDebut || '');
    setTraitement(am.traitement || '');
    setEvolution(am.evolution || '');
    setComplication(am.complication || '');
    setTypeLocalisation(am.typeLocalisation || '');
    setCauseSiege(am.causeSiege || '');
    setLieuPriseEnCharge(am.lieuPriseEnCharge || '');
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
        await axios.delete(`http://localhost:8081/api/antecedents-medicaux/${idToDelete}`);
      } else {
        await deleteMutation.mutateAsync(idToDelete);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Antécédent médical supprimé.");
      setToastOpen(true);

      queryClient.invalidateQueries({ queryKey: ['medicalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorMedicalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['medical-history'] });
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
      filename = `export_ant_medicaux_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await medicalService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_ant_medicaux_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun antécédent médical à exporter.");
      return;
    }

    const headers = ["identifiantAMed", "patientId", "type", "sousType", "dateDebut", "complication", "traitement", "evolution", "typeLocalisation", "causeSiege", "lieuPriseEnCharge"];
    const csvRows = datasetToExport.map(am => [
      am.identifiantAMed || "",
      am.patientId || am.patient?.identifiantP || "",
      `"${String(am.type || '').replace(/"/g, '""')}"`,
      `"${String(am.sousType || '').replace(/"/g, '""')}"`,
      am.dateDebut || "",
      `"${String(am.complication || '').replace(/"/g, '""')}"`,
      `"${String(am.traitement || '').replace(/"/g, '""')}"`,
      `"${String(am.evolution || '').replace(/"/g, '""')}"`,
      `"${String(am.typeLocalisation || '').replace(/"/g, '""')}"`,
      `"${String(am.causeSiege || '').replace(/"/g, '""')}"`,
      `"${String(am.lieuPriseEnCharge || '').replace(/"/g, '""')}"`
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
      ? ["patientId", "type", "sousType", "dateDebut", "complication", "traitement", "evolution", "typeLocalisation", "causeSiege", "lieuPriseEnCharge"]
      : ["type", "sousType", "dateDebut", "complication", "traitement", "evolution", "typeLocalisation", "causeSiege", "lieuPriseEnCharge"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_ant_medicaux_global.csv" : "modele_import_ant_medicaux_personnel.csv";
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
          type: row.type,
          sousType: row.sousType,
          dateDebut: row.dateDebut || undefined,
          complication: row.complication || 'Aucune',
          traitement: row.traitement || 'Non précisé',
          evolution: row.evolution || 'Non précisée',
          typeLocalisation: row.typeLocalisation || '',
          causeSiege: row.causeSiege || '',
          lieuPriseEnCharge: row.lieuPriseEnCharge || ''
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await medicalService.create(targetPatientId, payload);
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
    
    setToastMessage(`${successCount} antécédent(s) médical(aux) importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['medicalHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorMedicalHistory'] });
    queryClient.invalidateQueries({ queryKey: ['medical-history'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Registre des Antécédents Médicaux
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
            <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-xl flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#2B5296]">
                  {isDonorMode ? "Donneur Actif" : "Patient Actif"} : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`}
                </span>
                <span className="text-[10px] font-black text-[#6588BB] uppercase tracking-wider mt-1">
                  Autonomie : <span className="text-[#2B5296] font-extrabold">{localAutonomie || 'Non évaluée'}</span>
                </span>
              </div>
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
              {isDonorMode ? "Votre cohorte de donneurs" : "Votre cohorte d'antécédents médicaux"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5">
              {isDonorMode 
                ? "Ouvrez le dossier d'un donneur pour évaluer son autonomie et consigner ses pathologies."
                : "Ouvrez le dossier d'un patient pour évaluer son autonomie et consigner ses pathologies."}
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
              <p className="font-semibold">Aucun dossier actif dans cette cohorte.</p>
            </div>
          )}
        </div>
      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {!isReadOnly && (
            <div className="lg:col-span-1">
              {(!selectedAM || selectedAM) ? (
                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
                  <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
                    <IconPlus size={20} /> {selectedAM ? "Modifier l'Antécédent" : "Saisir un Antécédent"}
                  </h3>
                  
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Catégorie Médicale *</label>
                      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {type === 'Cardio-vasculaires' && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Sous-pathologie *</label>
                          <select value={sousType} onChange={(e) => setSousType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold">
                            <option value="HTA">HTA</option>
                            <option value="Insuffisance Coronaire">Insuffisance Coronaire</option>
                            <option value="Valvulopathie">Valvulopathie</option>
                            <option value="Arythmie">Arythmie</option>
                            <option value="Péricardite">Péricardite</option>
                            <option value="AVC">AVC</option>
                            <option value="Artériopathie MI">Artériopathie MI</option>
                            <option value="Amputation">Amputation</option>
                          </select>
                        </div>

                        {sousType === 'HTA' && (
                          <div>
                            <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Complications</label>
                            <input type="text" value={complication} onChange={(e) => setComplication(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                          </div>
                        )}

                        {(sousType === 'AVC' || sousType === 'Artériopathie MI') && (
                          <div>
                            <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type / Localisation *</label>
                            <input type="text" value={typeLocalisation} onChange={(e) => setTypeLocalisation(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: Hémisphère gauche, Jambe droite..." />
                          </div>
                        )}

                        {sousType === 'Amputation' && (
                          <div>
                            <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Cause / Siège *</label>
                            <input type="text" value={causeSiege} onChange={(e) => setCauseSiege(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                          </div>
                        )}
                      </div>
                    )}

                    {type === 'Diabète sucré' && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type de Diabète *</label>
                          <div className="flex gap-4">
                            {["Type 1", "Type 2", "Autre", "Non précisé"].map(t => (
                              <label key={t} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                                <input type="radio" checked={diabeteType === t} onChange={() => setDiabeteType(t)} /> {t}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Traitement *</label>
                          <select value={diabeteTraitement} onChange={(e) => setDiabeteTraitement(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                            <option value="Aucun">Aucun</option>
                            <option value="Insuline">Insuline</option>
                            <option value="Anti-diabétiques oraux">Anti-diabétiques oraux</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Complications associées</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {["Rétinopathie", "Neuropathie", "HypoTA orthostatique", "Gastroparésie", "Diarrhée motrice", "Troubles vésicaux", "Impuissance sexuelle"].map(c => (
                              <label key={c} className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={diabeteComplications.includes(c)} onChange={() => {
                                  setDiabeteComplications(diabeteComplications.includes(c) ? diabeteComplications.filter(v => v !== c) : [...diabeteComplications, c]);
                                }} className="rounded" />
                                <span>{c}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {type === 'Thromboses vasculaires' && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Siège *</label>
                          <input type="text" value={causeSiege} onChange={(e) => setCauseSiege(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                        </div>
                      </div>
                    )}

                    {['Hépathopathie', 'Maladie Neurologique', 'Maladie Gastro-intestinale', 'Maladie / Trouble métabolique', 'Autre'].includes(type) && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu de prise en charge & Médecin référent</label>
                          <input type="text" value={lieuPriseEnCharge} onChange={(e) => setLieuPriseEnCharge(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date Début *</label>
                          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Évolution *</label>
                          <input type="text" value={evolution} onChange={(e) => setEvolution(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                        </div>
                      </div>

                      {type !== 'Diabète sucré' && (
                        <div>
                          <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Traitement *</label>
                          <input type="text" value={traitement} onChange={(e) => setTraitement(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 pb-2">
                      <label className="block text-[10px] font-black text-[#2B5296] uppercase mb-2.5">
                        Évaluation de l'Autonomie
                      </label>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        {["Autonome", "Marche avec aide", "Assis, Chaise roulante", "Alité"].map(niveau => (
                          <label key={niveau} className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-semibold">
                            <input 
                              type="radio" 
                              name="autonomie" 
                              checked={localAutonomie === niveau} 
                              onChange={() => handleAutonomieChange(niveau)} 
                              className="text-[#2B5296] focus:ring-[#2B5296]"
                            />
                            <span>{niveau}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedAM && (
                        <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                      )}
                      <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                        {selectedAM ? "Sauvegarder" : "Enregistrer l'Antécédent"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                  <IconReportMedical size={32} className="text-[#6588BB] mb-2" />
                  <p className="text-xs font-bold text-slate-800">Dossier Médical Actif</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Les pathologies de ce dossier ont été enregistrées. Utilisez le panneau de consultation à droite pour les examiner ou les exporter.</p>
                </div>
              )}
            </div>
          )}

          <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between`}>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconMedicalCross size={22} className="text-[#2B5296]" />
                    Antécédents Médicaux ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer les pathologies..." 
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
              ) : filteredMedicals && filteredMedicals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMedicals.map((m) => (
                    <div key={m.identifiantAMed} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase truncate max-w-[200px]">
                            {m.type}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500">
                            Évolution : {m.evolution}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mt-3">
                          Pathologie : {m.sousType}
                        </h4>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          <p><IconCalendar size={14} className="inline mr-1" /> Diagnostiqué le : <strong>{m.dateDebut}</strong></p>
                          {m.traitement && <p>Traitement : <strong>{m.traitement}</strong></p>}
                          {m.complication && <p className="text-red-500 font-bold">Complications : {m.complication}</p>}
                          {m.typeLocalisation && <p>Localisation : {m.typeLocalisation}</p>}
                          {m.causeSiege && <p>Cause / Siège : {m.causeSiege}</p>}
                          {m.lieuPriseEnCharge && <p className="text-slate-500 italic"><IconNotes size={14} className="inline mr-1" /> Prise en charge : {m.lieuPriseEnCharge}</p>}
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                          <button onClick={() => triggerEdit(m)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={16} /></button>
                          <button onClick={() => triggerDelete(m.identifiantAMed!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun antécédent médical enregistré ne correspond à vos filtres.</p>
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
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer les habitudes de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer l'antécédent ?" message="Cette action effacera définitivement cette pathologie du registre clinique." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};