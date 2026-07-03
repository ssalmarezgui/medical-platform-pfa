import { useState, useRef, useEffect } from 'react';
import { useNephropathyHistory, useBilanHistory, useDialyseHistory, useBiopsieHistory } from '../features/nephropathy/hooks/useNephropathy';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { nephropathyService } from '../features/nephropathy/api/nephropathyService';
import { 
  IconMedicalCross, IconSearch, IconPlus, IconTrash, IconUserCheck, IconReportMedical, IconFlask, IconInfoCircle, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen, IconAlertCircle
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import axios from 'axios';

import { usePermission } from '../hooks/usePermission';

export const NephropathyPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const { hasPermission } = usePermission();
  const canAccess = hasPermission('READ_PATIENT') || hasPermission('WRITE_PATIENT');

  const isReadOnly = !hasPermission('WRITE_PATIENT');

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter l'historique de néphropathie.
      </div>
    );
  }
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: history, isLoading: loadingHistory } = useNephropathyHistory(patientIdString || undefined);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const [selectedNI, setSelectedNI] = useState<any | null>(null);
  const [selectedDialyse, setSelectedDialyse] = useState<any | null>(null);
  const [selectedBilan, setSelectedBilan] = useState<any | null>(null);

  const [typeCliniqueNI, setTypeCliniqueNI] = useState('');
  const [causeNI, setCauseNI] = useState('');
  const [typeHistologiqueNI, setTypeHistologiqueNI] = useState('');
  const [stadeMaladiNI, setStadeMaladiNI] = useState('Stade 5');

  const [selectedNIId, setSelectedNIId] = useState<number | null>(null);
  const { data: bilans } = useBilanHistory(selectedNIId || undefined);
  const { data: dialyses } = useDialyseHistory(selectedNIId || undefined);
  const { data: biopsie } = useBiopsieHistory(selectedNIId || undefined);

  const [typeDialyse, setTypeDialyse] = useState('');

  const [noteBiopsie, setNoteBiopsie] = useState('à traiter après réunion avec madame');

  const [dateBilanB, setDateBilanB] = useState('');
  const [descriptionBilanB, setDescriptionBilanB] = useState('');
  const [resultatBilanB, setResultatBilanB] = useState('');
  const [rapportBilanB, setRapportBilanB] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'NI' | 'DIALYSE' | 'BILAN'>('NI');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal' | 'dialyse' | 'bilan' | 'biopsie'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPatients = patients?.filter(p => {
    const nomComplet = `${p.prenomP} ${p.nomP}`.toLowerCase();
    return nomComplet.includes(patientSearch.toLowerCase()) || String(p.identifiantP) === patientSearch;
  });

  const filteredLocalNephropathies = history?.filter(ni => {
    const typeStr = ni.typeCliniqueNI?.toLowerCase() || '';
    const causeStr = ni.causeNI?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return typeStr.includes(query) || causeStr.includes(query);
  }) || [];

  const selectedPatient = patients?.find(p => p.identifiantP === selectedPatientId);

  useEffect(() => {
    if (selectedNI) {
      setTypeCliniqueNI(selectedNI.typeCliniqueNI);
      setCauseNI(selectedNI.causeNI);
      setTypeHistologiqueNI(selectedNI.typeHistologiqueNI || '');
      setStadeMaladiNI(selectedNI.stadeMaladiNI || 'Stade 5');
    }
  }, [selectedNI]);

  useEffect(() => {
    if (selectedDialyse) {
      setTypeDialyse(selectedDialyse.typeDialyse);
    }
  }, [selectedDialyse]);

  useEffect(() => {
    if (selectedBilan) {
      setDateBilanB(selectedBilan.dateBilanB);
      setDescriptionBilanB(selectedBilan.descriptionBilanB);
      setResultatBilanB(selectedBilan.resultatBilanB);
      setRapportBilanB(selectedBilan.rapportBilanB);
    }
  }, [selectedBilan]);

  useEffect(() => {
    if (biopsie) {
      setNoteBiopsie(biopsie.noteBiopsie || '');
    } else {
      setNoteBiopsie('à traiter après réunion avec madame');
    }
  }, [biopsie]);

  const resetForm = () => {
    setSelectedNI(null);
    setTypeCliniqueNI('');
    setCauseNI('');
    setTypeHistologiqueNI('');
    setStadeMaladiNI('Stade 5');
  };

  const handleSaveNI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !typeCliniqueNI) return;

    const payload = { typeCliniqueNI, causeNI, typeHistologiqueNI, stadeMaladiNI, patientId: patientIdString };
    try {
      if (selectedNI) {
        await nephropathyService.updateNI(selectedNI.identifiantNI, payload);
        setToastMessage("Diagnostic de néphropathie mis à jour !");
      } else {
        await nephropathyService.createNI(patientIdString, payload);
        setToastMessage("Néphropathie initiale enregistrée !");
      }

      setToastType('success');
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: ['nephropathyHistory', patientIdString] });
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const handleAddDialyse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNIId || !typeDialyse) return;

    try {
      if (selectedDialyse) {
        await axios.put(`http://localhost:8081/api/dialyses/${selectedDialyse.identifiantDia}`, {
          typeDialyse,
          nephropathieId: selectedNIId
        });
        setToastMessage("Dialyse mise à jour !");
      } else {
        await nephropathyService.createDialyse(selectedNIId, {
          typeDialyse,
          nephropathieId: selectedNIId
        });
        setToastMessage("Dialyse liée !");
      }
      queryClient.invalidateQueries({ queryKey: ['dialyseHistory', selectedNIId] });
      setToastType('success'); setToastOpen(true);
      setTypeDialyse(''); setSelectedDialyse(null);
    } catch {
      alert("Erreur d'enregistrement.");
    }
  };

  const handleSaveBiopsie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNIId) return;

    const payload = {
      noteBiopsie,
      nephropathieId: selectedNIId
    };

    try {
      if (biopsie && biopsie.identifiantPB) {
        await axios.put(`http://localhost:8081/api/biopsies/${biopsie.identifiantPB}`, payload);
        setToastMessage("Note biopsique mise à jour !");
      } else {
        await nephropathyService.saveBiopsie(selectedNIId, payload);
        setToastMessage("Relation biopsique établie !");
      }
      queryClient.invalidateQueries({ queryKey: ['biopsieHistory', selectedNIId] });
      setToastType('success'); 
      setToastOpen(true);
    } catch {
      alert("Erreur d'enregistrement de la biopsie.");
    }
  };

  const handleSaveBilan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNIId || !dateBilanB) return;

    try {
      const payload = {
        dateBilanB,
        descriptionBilanB,
        resultatBilanB,
        rapportBilanB,
        nephropathieId: selectedNIId
      };

      if (selectedBilan) {
        await axios.put(`http://localhost:8081/api/bilans-pregreffe/${selectedBilan.identifiantB}`, payload);
        setToastMessage("Rapport du bilan mis à jour !");
      } else {
        await nephropathyService.saveBilan(selectedNIId, payload);
        setToastMessage("Rapport du bilan pré-greffe enregistré !");
      }

      queryClient.invalidateQueries({ queryKey: ['bilanHistory', selectedNIId] });
      setToastType('success'); setToastOpen(true);
      
      setSelectedBilan(null);
      setDateBilanB(''); setDescriptionBilanB(''); setResultatBilanB(''); setRapportBilanB('');
    } catch {
      alert("Erreur d'enregistrement du bilan.");
    }
  };

  const triggerDelete = (id: number, type: 'NI' | 'DIALYSE' | 'BILAN') => {
    setIdToDelete(id);
    setDeleteType(type);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      if (deleteType === 'NI') {
        await nephropathyService.deleteNI(idToDelete);
        queryClient.invalidateQueries({ queryKey: ['nephropathyHistory', patientIdString] });
        setSelectedNIId(null);
      } else if (deleteType === 'DIALYSE') {
        await nephropathyService.deleteDialyse(idToDelete);
        queryClient.invalidateQueries({ queryKey: ['dialyseHistory', selectedNIId] });
      } else if (deleteType === 'BILAN') {
        await axios.delete(`http://localhost:8081/api/bilans-pregreffe/${idToDelete}`);
        queryClient.invalidateQueries({ queryKey: ['bilanHistory', selectedNIId] });
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Élément supprimé.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur de suppression.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = async (mode: 'global' | 'personal' | 'dialyse' | 'bilan' | 'biopsie') => {
    let datasetToExport: any[] = [];
    let headers: string[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = history || [];
      filename = `export_nephropathies_patient_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ["identifiantNI", "patientId", "typeCliniqueNI", "causeNI", "typeHistologiqueNI", "stadeMaladiNI"];
    } else if (mode === 'dialyse' && selectedNIId) {
      datasetToExport = dialyses || [];
      filename = `export_dialyses_nephropathie_${selectedNIId}_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ["identifiantDia", "typeDialyse", "nephropathieId"];
    } else if (mode === 'bilan' && selectedNIId) {
      datasetToExport = bilans ? [bilans] : [];
      filename = `export_bilans_nephropathie_${selectedNIId}_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ["identifiantB", "dateBilanB", "descriptionBilanB", "resultatBilanB", "rapportBilanB", "nephropathieId"];
    } else if (mode === 'biopsie' && selectedNIId) {
      datasetToExport = biopsie ? [biopsie] : [];
      filename = `export_biopsies_nephropathie_${selectedNIId}_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ["identifiantPB", "nephropathieId"];
    } else {
      try {
        const globalData = await nephropathyService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_nephropathies_cohorte_${new Date().toISOString().split('T')[0]}.csv`;
        headers = ["identifiantNI", "patientId", "typeCliniqueNI", "causeNI", "typeHistologiqueNI", "stadeMaladiNI"];
      } catch {
        alert("Erreur d'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    let csvRows: string[] = [];
    if (mode === 'personal' || mode === 'global') {
      csvRows = datasetToExport.map(ni => [
        ni.identifiantNI || "",
        ni.patientId || ni.patient?.identifiantP || "",
        `"${String(ni.typeCliniqueNI || '').replace(/"/g, '""')}"`,
        `"${String(ni.causeNI || '').replace(/"/g, '""')}"`,
        `"${String(ni.typeHistologiqueNI || '').replace(/"/g, '""')}"`,
        `"${String(ni.stadeMaladiNI || '').replace(/"/g, '""')}"`
      ].join(";"));
    } else if (mode === 'dialyse') {
      csvRows = datasetToExport.map(d => [
        d.identifiantDia || "",
        `"${String(d.typeDialyse || '').replace(/"/g, '""')}"`,
        d.nephropathieId || ""
      ].join(";"));
    } else if (mode === 'bilan') {
      csvRows = datasetToExport.map(b => [
        b.identifiantB || "",
        b.dateBilanB || "",
        `"${String(b.descriptionBilanB || '').replace(/"/g, '""')}"`,
        `"${String(b.resultatBilanB || '').replace(/"/g, '""')}"`,
        `"${String(b.rapportBilanB || '').replace(/"/g, '""')}"`,
        b.nephropathieId || ""
      ].join(";"));
    } else if (mode === 'biopsie') {
      csvRows = datasetToExport.map(bp => [
        bp.identifiantPB || "",
        bp.nephropathieId || ""
      ].join(";"));
    }

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = (mode: 'global' | 'personal' | 'dialyse' | 'bilan' | 'biopsie') => {
    let headers: string[] = [];
    if (mode === 'global') {
      headers = ["patientId", "typeCliniqueNI", "causeNI", "typeHistologiqueNI", "stadeMaladiNI"];
    } else if (mode === 'personal') {
      headers = ["typeCliniqueNI", "causeNI", "typeHistologiqueNI", "stadeMaladiNI"];
    } else if (mode === 'dialyse') {
      headers = ["typeDialyse"];
    } else if (mode === 'bilan') {
      headers = ["dateBilanB", "descriptionBilanB", "resultatBilanB", "rapportBilanB"];
    } else if (mode === 'biopsie') {
      headers = ["noteBiopsie"];
    }

    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `modele_import_${mode}.csv`;
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

    if (importMode === 'personal' || importMode === 'global') {
      for (const row of previewData) {
        try {
          const payload = {
            typeCliniqueNI: row.typeCliniqueNI,
            causeNI: row.causeNI,
            typeHistologiqueNI: row.typeHistologiqueNI || '',
            stadeMaladiNI: row.stadeMaladiNI || 'Stade 5',
            patientId: importMode === 'global' ? row.patientId : patientIdString
          };

          const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
          if (targetPatientId) {
            await nephropathyService.createNI(targetPatientId, payload);
            successCount++;
          }
        } catch (err) {
          console.error("Erreur d'import :", err);
        }
      }
      setToastMessage(`${successCount} néphropathie(s) initiale(s) importée(s) !`);
    } else if (importMode === 'dialyse' && selectedNIId) {
      for (const row of previewData) {
        try {
          await nephropathyService.createDialyse(selectedNIId, {
            typeDialyse: row.typeDialyse,
            nephropathieId: selectedNIId
          });
          successCount++;
        } catch (err) {
          console.error("Erreur import dialyse :", err);
        }
      }
      setToastMessage(`${successCount} séance(s) de dialyse liée(s) !`);
      queryClient.invalidateQueries({ queryKey: ['dialyseHistory', selectedNIId] });
    } else if (importMode === 'bilan' && selectedNIId) {
      if (previewData[0]) {
        setDateBilanB(previewData[0].dateBilanB || '');
        setDescriptionBilanB(previewData[0].descriptionBilanB || '');
        setResultatBilanB(previewData[0].resultatBilanB || '');
        setRapportBilanB(previewData[0].rapportBilanB || '');
        successCount = 1;
        setToastMessage(`Rapport de bilan importé au formulaire.`);
      }
    } else if (importMode === 'biopsie' && selectedNIId) {
      if (previewData[0]) {
        setNoteBiopsie(previewData[0].noteBiopsie || '');
        successCount = 1;
        setToastMessage(`Note biopsique importée.`);
      }
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['nephropathyHistory', patientIdString] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Bilan de Néphropathie & Enquête Pré-greffe
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
              placeholder="Rechercher un patient par nom ou par identifiant unique (ID)..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const found = patients?.find(p => 
                    String(p.identifiantP) === patientSearch || 
                    `${p.prenomP} ${p.nomP}`.toLowerCase() === patientSearch.toLowerCase()
                  );
                  if (found) {
                    setSelectedPatientId(found.identifiantP!);
                    setPatientSearch('');
                    setLocalSearchTerm('');
                    setSelectedNIId(null);
                    setSelectedNI(null);
                  }
                }
              }}
            />
            {patientSearch && filteredPatients && filteredPatients.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y">
                {filteredPatients.map(p => (
                  <div key={p.identifiantP} onClick={() => { setSelectedPatientId(p.identifiantP!); setPatientSearch(''); setLocalSearchTerm(''); }} className="p-3 text-xs font-semibold hover:bg-blue-50 text-slate-800 cursor-pointer flex justify-between">
                    <span>{p.prenomP} {p.nomP}</span>
                    <span className="text-[#6588BB]">ID : {p.identifiantP}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#2B5296]">Patient Actif : {selectedPatient.prenomP} {selectedPatient.nomP}</span>
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); setSelectedNIId(null); setSelectedNI(null); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                Fermer le dossier
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">Registre Historique de Néphropathie de la Cohorte</h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold font-sans">Visualisez et importez les diagnostics d'IRC d'origine de vos candidats.</p>
          </div>

          {patients && patients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p) => (
                <div 
                  key={p.identifiantP}
                  onClick={() => { setSelectedPatientId(p.identifiantP!); setLocalSearchTerm(''); }}
                  className="border border-slate-100 hover:border-[#2B5296]/50 bg-[#F8FAFC]/50 hover:bg-blue-50/10 p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{p.prenomP} {p.nomP}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">ID : {p.identifiantP}</p>
                    <p className="text-[10px] text-[#6588BB] font-semibold mt-1">CIN : {p.numeroCin}</p>
                  </div>
                  <IconFolderOpen size={20} className="text-[#2B5296]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <IconAlertCircle size={40} className="text-slate-300 mb-3" />
              <p className="font-semibold">Aucun patient actif rattaché à votre profil.</p>
            </div>
          )}
        </div>
      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {!isReadOnly && (
            <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit space-y-6">
              <h3 className="text-base font-bold text-[#2B5296] flex items-center gap-1.5">
                <IconPlus size={20} /> {selectedNI ? "Modifier la Néphropathie" : "Saisir la Néphropathie d'Origine"}
              </h3>
              
              <form onSubmit={handleSaveNI} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type Clinique *</label>
                  <input type="text" value={typeCliniqueNI} onChange={(e) => setTypeCliniqueNI(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-xs bg-white" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Cause / Pathologie initiale</label>
                  <input type="text" value={causeNI} onChange={(e) => setCauseNI(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none animate-none" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type Histologique</label>
                  <input type="text" value={typeHistologiqueNI} onChange={(e) => setTypeHistologiqueNI(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Stade IRC *</label>
                  <select value={stadeMaladiNI} onChange={(e) => setStadeMaladiNI(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold outline-none text-xs text-slate-800">
                    <option value="Stade 3 - Modérée">Stade 3 - Modérée</option>
                    <option value="Stade 4 - Sévère">Stade 4 - Sévère</option>
                    <option value="Stade 5 - Terminal">Stade 5 - Terminal</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {selectedNI && (
                    <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                      Annuler
                    </button>
                  )}
                  <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                    {selectedNI ? "Sauvegarder" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            
            <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconMedicalCross size={22} className="text-[#2B5296]" />
                  Historique des Néphropathies d'Origine
                </h3>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par type ou cause..." 
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
                <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredLocalNephropathies && filteredLocalNephropathies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLocalNephropathies.map((ni) => (
                    <div 
                      key={ni.identifiantNI} 
                      onClick={() => setSelectedNIId(ni.identifiantNI!)}
                      className={`border p-5 rounded-2xl cursor-pointer transition-all ${
                        selectedNIId === ni.identifiantNI 
                          ? 'border-[#2B5296] bg-blue-50/30 ring-1 ring-[#2B5296]/20' 
                          : 'border-slate-100 bg-[#F8FAFC]/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase">
                          {ni.typeCliniqueNI}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold border px-2 py-0.5 rounded-full bg-white">{ni.stadeMaladiNI}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mt-2">Cause : {ni.causeNI}</h4>
                      {ni.typeHistologiqueNI && <p className="text-xs text-[#6588BB] mt-1 font-semibold">Histologie : {ni.typeHistologiqueNI}</p>}

                      {!isReadOnly && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedNI(ni)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors" title="Modifier"><IconEdit size={14} /></button>
                          <button onClick={() => triggerDelete(ni.identifiantNI!, 'NI')} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer" title="Supprimer"><IconTrash size={14} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">Aucun diagnostic correspondant n'a été enregistré.</div>
              )}
            </div>

            {selectedNIId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-5 duration-300">
                
                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="text-sm font-bold text-[#2B5296] flex items-center gap-1.5"><IconInfoCircle size={18} /> Historique de la Dialyse</h4>
                    
                    <div className="flex gap-1">
                      {!isReadOnly && <button onClick={() => { setImportMode('dialyse'); setIsImportOpen(true); }} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Importer des dialyses"><IconDatabaseImport size={14} /></button>}
                      <button onClick={() => handleExportCSV('dialyse')} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Exporter l'historique"><IconFileSpreadsheet size={14} /></button>
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <form onSubmit={handleAddDialyse} className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={typeDialyse} 
                          onChange={(e) => setTypeDialyse(e.target.value)} 
                          required 
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-[11px]" 
                          placeholder={selectedDialyse ? "Modifier le nom de la dialyse" : ""} 
                        />
                        <button type="submit" className="bg-[#2B5296] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer">
                          {selectedDialyse ? "Enregistrer" : "Lier"}
                        </button>
                      </div>
                      {selectedDialyse && (
                        <button type="button" onClick={() => { setSelectedDialyse(null); setTypeDialyse(''); }} className="text-[10px] text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">Annuler la modification</button>
                      )}
                    </form>
                  )}

                  <div className="border border-slate-50 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <tbody className="divide-y">
                        {dialyses && dialyses.length > 0 ? (
                          dialyses.map((d) => (
                            <tr key={d.identifiantDia} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-bold text-[#2B5296]">{d.typeDialyse}</td>
                              <td className="px-3 py-2 text-right">
                                {!isReadOnly && (
                                  <div className="flex justify-end gap-1">
                                    <button onClick={() => setSelectedDialyse(d)} className="p-1 hover:bg-blue-50 text-[#006591] rounded border-none cursor-pointer"><IconEdit size={12} /></button>
                                    <button onClick={() => triggerDelete(d.identifiantDia!, 'DIALYSE')} className="p-1 hover:bg-red-50 text-red-500 rounded border-none cursor-pointer"><IconTrash size={12} /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={2} className="p-4 text-center text-slate-400">Aucune dialyse liée.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="text-sm font-bold text-[#2B5296] flex items-center gap-1.5"><IconFlask size={18} /> Paramètres Biopsiques</h4>
                    
                    <div className="flex gap-1">
                      {!isReadOnly && <button onClick={() => { setImportMode('biopsie'); setIsImportOpen(true); }} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Importer la note biopsique"><IconDatabaseImport size={14} /></button>}
                      <button onClick={() => handleExportCSV('biopsie')} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Exporter la biopsie"><IconFileSpreadsheet size={14} /></button>
                    </div>
                  </div>
                  
                  {isReadOnly ? (
                    <div className="space-y-2 text-xs text-slate-600 bg-[#F8FAFC]/50 p-4 rounded-2xl border">
                      <p className="font-bold text-[#2B5296]">Biopsie :</p>
                      <p className="italic font-semibold text-slate-800">"{biopsie ? noteBiopsie : 'Aucune biopsie enregistrée.'}"</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveBiopsie} className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[#6588BB] uppercase">Note des paramètres biopsiques</label>
                        <input 
                          type="text" 
                          value={noteBiopsie} 
                          onChange={(e) => setNoteBiopsie(e.target.value)} 
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 bg-[#F8FAFC]/50" 
                          placeholder=""
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#2B5296] text-white py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">
                        {!biopsie ? "Lier & Établir la biopsie" : "Mettre à jour la biopsie"}
                      </button>
                    </form>
                  )}
                </div>

                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-6 shadow-sm space-y-4 col-span-2">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="text-sm font-bold text-[#2B5296] flex items-center gap-1.5"><IconReportMedical size={18} /> Rapport de Bilan Pré-greffe</h4>
                    
                    <div className="flex gap-1">
                      {!isReadOnly && <button onClick={() => { setImportMode('bilan'); setIsImportOpen(true); }} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Importer le bilan"><IconDatabaseImport size={14} /></button>}
                      <button onClick={() => handleExportCSV('bilan')} className="p-1.5 hover:bg-slate-100 text-[#006591] rounded cursor-pointer border-none bg-transparent" title="Exporter le bilan"><IconFileSpreadsheet size={14} /></button>
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <form onSubmit={handleSaveBilan} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Date du bilan *</label>
                          <input type="date" value={dateBilanB} onChange={(e) => setDateBilanB(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px]" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Résultat Décisionnel *</label>
                          <textarea 
                            value={resultatBilanB} 
                            onChange={(e) => setResultatBilanB(e.target.value)} 
                            required 
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] resize-none bg-white outline-none" 
                            placeholder=""
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Description Synthétique *</label>
                          <textarea value={descriptionBilanB} onChange={(e) => setDescriptionBilanB(e.target.value)} required rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] resize-none bg-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Compte-rendu détaillé *</label>
                          <textarea value={rapportBilanB} onChange={(e) => setRapportBilanB(e.target.value)} required rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] resize-none bg-white outline-none" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {selectedBilan && (
                          <button type="button" onClick={() => { setSelectedBilan(null); setDateBilanB(''); setDescriptionBilanB(''); setResultatBilanB(''); setRapportBilanB(''); }} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold border-none cursor-pointer">
                            Annuler
                          </button>
                        )}
                        <button type="submit" className="bg-[#2B5296] text-white px-6 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">
                          {selectedBilan ? "Sauvegarder" : "Enregistrer"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="border-t pt-4">
                    <h5 className="text-xs font-bold text-[#6588BB] mb-3 uppercase tracking-wider">Bilans Enregistrés</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {bilans && bilans.length > 0 ? (
                        bilans.map((b) => (
                          <div key={b.identifiantB} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] relative leading-relaxed">
                            <p>Bilan du : <strong className="text-slate-800">{b.dateBilanB}</strong></p>
                            <p className="mt-1 text-[#2B5296] font-bold">Décision : {b.resultatBilanB}</p>
                            <p className="mt-1 text-slate-600">Synthèse : {b.descriptionBilanB}</p>
                            <p className="mt-1 italic text-slate-500">Détails : "{b.rapportBilanB}"</p>
                            
                            {!isReadOnly && (
                              <div className="absolute top-3 right-3 flex gap-1.5">
                                <button onClick={() => setSelectedBilan(b)} className="p-1 hover:bg-blue-100 text-[#006591] rounded border-none cursor-pointer" title="Modifier"><IconEdit size={12} /></button>
                                <button onClick={() => triggerDelete(b.identifiantB!, 'BILAN')} className="p-1 hover:bg-red-100 text-red-500 rounded border-none cursor-pointer" title="Supprimer"><IconTrash size={12} /></button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-4 italic">Aucun bilan pré-greffe enregistré pour cette néphropathie.</p>
                      )}
                    </div>
                  </div>
                </div>

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
                {importMode === 'global' ? "Importation de Cohorte Néphrologique (CSV)" : `Importer le dossier de ${selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer l'élément ?" message="Cette action effacera définitivement cette ligne du registre clinique." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};