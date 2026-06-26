import { useState, useRef, useEffect } from 'react';
import { useBloodHistory, useSaveBlood, useDeleteBlood } from '../features/biochemistry-blood/hooks/useBlood';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { bloodService } from '../features/biochemistry-blood/api/bloodService';
import { 
  IconFlask, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconReportMedical, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorBloodHistory } from '../features/biochemistry-blood/hooks/useBlood';

export const BiochemistryBloodPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const location = useLocation();
  const isDonorMode = location.pathname.startsWith('/donors');
  const { data : donors } = useDonors();

  const subjects = isDonorMode ? donors : patients;
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: patientBlood, isLoading: loadingPatientBlood } = useBloodHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorBlood, isLoading: loadingDonorBlood } = useDonorBloodHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const blood = isDonorMode ? donorBlood : patientBlood;
  const loadingBlood = isDonorMode ? loadingDonorBlood : loadingPatientBlood;

  const saveMutation = useSaveBlood();
  const deleteMutation = useDeleteBlood(patientIdString);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const listExamensSang = [
    "Urée sanguine",
    "Créatininémie",
    "Natrémie/ Chlorémie",
    "Kaliémie/Bicarbonates",
    "Calcémie/Phosphorémie (phospho-calcémique)",
    "Glycémie à jeun/PP",
    "Hb A1C",
    "Uricémie",
    "Cholestérol/ Triglycérides",
    "LDL/HDL",
    "CRP/Procalcitonine",
    "ASAT/ALAT",
    "Bilirubine T/C",
    "γ GT/Ph alcalines",
    "Protidémie/ Albuminémie",
    "Globulines α₁/α₂",
    "Globulines β₁/ β1γ",
    "γ Globulines",
    "CPK/LDH",
    "Lipase",
    "Autres"
  ];

  const dictUnites: Record<string, string[]> = {
    "Urée sanguine": ["mmol/L", "g/L"],
    "Créatininémie": ["µmol/L", "mg/L"],
    "Natrémie/ Chlorémie": ["mmol/L"],
    "Kaliémie/Bicarbonates": ["mmol/L"],
    "Calcémie/Phosphorémie (phospho-calcémique)": ["mmol/L", "mg/L"],
    "Glycémie à jeun/PP": ["mmol/L", "g/L"],
    "Hb A1C": ["%"],
    "Uricémie": ["µmol/L", "mg/L"],
    "Cholestérol/ Triglycérides": ["mmol/L", "g/L"],
    "LDL/HDL": ["mmol/L", "g/L"],
    "CRP/Procalcitonine": ["mg/L", "µg/L"],
    "ASAT/ALAT": ["U/L"],
    "Bilirubine T/C": ["µmol/L", "mg/L"],
    "γ GT/Ph alcalines": ["U/L"],
    "Protidémie/ Albuminémie": ["g/L"],
    "Globulines α₁/α₂": ["g/L", "%"],
    "Globulines β₁/ β1γ": ["g/L", "%"],
    "γ Globulines": ["g/L", "%"],
    "CPK/LDH": ["U/L"],
    "Lipase": ["U/L"],
    "Autres": ["-"]
  };

  const checkIfPathological = (examen: string, valeurStr: string, unite: string): boolean => {
    const val = parseFloat(valeurStr.replace(',', '.'));
    if (isNaN(val)) return false;

    switch (examen) {
      case "Urée sanguine":
        if (unite === "mmol/L") return val < 3.2 || val > 8.2;
        if (unite === "g/L") return val < 0.192 || val > 0.492;
        break;
      case "Créatininémie":
        if (unite === "µmol/L") return val < 53 || val > 97;
        if (unite === "mg/L") return val < 5.989 || val > 10.961;
        break;
      case "Natrémie/ Chlorémie":
        return val < 98 || val > 146;
      case "Kaliémie/Bicarbonates":
        return val < 3.5 || val > 4.5;
      case "Calcémie/Phosphorémie (phospho-calcémique)":
        if (unite === "mmol/L") return val < 0.78 || val > 2.6;
        if (unite === "mg/L") return val < 24.157 || val > 104.26;
        break;
      case "Glycémie à jeun/PP":
        if (unite === "mmol/L") return val < 3.89 || val > 5.83;
        if (unite === "g/L") return val < 0.7 || val > 1.049;
        break;
      case "Hb A1C":
        return val < 3.5 || val > 6.5;
      case "Uricémie":
        if (unite === "µmol/L") return val < 220 || val > 547;
        if (unite === "mg/L") return val < 36.96 || val > 91.896;
        break;
      case "Cholestérol/ Triglycérides":
        if (unite === "mmol/L") return val > 5.18;
        if (unite === "g/L") return val > 2.005;
        break;
      case "LDL/HDL":
        if (unite === "mmol/L") return val < 1.1 || val > 4.1;
        if (unite === "g/L") return val < 0.426 || val > 1.587;
        break;
      case "CRP/Procalcitonine":
        return val > 10;
      case "ASAT/ALAT":
        return val < 5 || val > 49;
      case "Bilirubine T/C":
        if (unite === "µmol/L") return val > 21;
        if (unite === "mg/L") return val > 12.285;
        break;
      case "γ GT/Ph alcalines":
        return val > 116;
      case "Protidémie/ Albuminémie":
        return val < 32 || val > 83;
      case "Globulines α₁/α₂":
        return val < 2 || val > 10;
      case "Globulines β₁/ β1γ":
        return val < 5 || val > 12;
      case "γ Globulines":
        return val < 8 || val > 16;
      case "CPK/LDH":
        return val < 46 || val > 246;
      case "Lipase":
        return val > 140;
      default:
        return false;
    }
    return false;
  };

  const [libelleBCS, setLibelleBCS] = useState("Biochimie Sanguine");
  const [descriptionBCS, setDescriptionBCS] = useState('');
  
  const [selectedExamen, setSelectedExamen] = useState(listExamensSang[0]);
  const [dateAna, setDateAna] = useState(new Date().toISOString().split('T')[0]);
  const [valeurAna, setValeurAna] = useState('');
  const [uniteAna, setUniteAna] = useState('mmol/L'); 
  
  const [editingAnalysisIndex, setEditingAnalysisIndex] = useState<number | null>(null);

  const [analysesSaisies, setAnalysesSaisies] = useState<any[]>([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unitesProposees = dictUnites[selectedExamen] || ["-"];
    setUniteAna(unitesProposees[0]);
  }, [selectedExamen]);

  useEffect(() => {
    if (blood) {
      setLibelleBCS(blood.libelleBCS);
      setDescriptionBCS(blood.descriptionBCS || '');
      setAnalysesSaisies(blood.analyses || []);
    } else {
      setLibelleBCS("Biochimie Sanguine");
      setDescriptionBCS('');
      setAnalysesSaisies([]);
    }
  }, [blood]);

  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const query = patientSearch.toLowerCase();
    
    return nomComplet.includes(query) || String(identifiant).toLowerCase().includes(query);
  });

  const filteredLocalAnalyses = analysesSaisies?.filter(row => {
    const nameStr = row.resultatAna?.toLowerCase() || '';
    const dateStr = row.dateAna || '';
    const query = localSearchTerm.toLowerCase();
    return nameStr.includes(query) || dateStr.includes(query);
  }) || [];

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  const handleAddAnalysisRow = () => {
    if (!valeurAna) return;

    const nouvelleLigne = {
      dateAna,
      resultatAna: selectedExamen,
      valeurAna,
      uniteAna,
      typeAnalyse: 'BIOCHIMIE_SANG'
    };

    if (editingAnalysisIndex !== null) {
      const nouvellesAnalyses = [...analysesSaisies];
      nouvellesAnalyses[editingAnalysisIndex] = nouvelleLigne;
      setAnalysesSaisies(nouvellesAnalyses);
      setEditingAnalysisIndex(null);
    } else {
      setAnalysesSaisies([...analysesSaisies, nouvelleLigne]);
    }
    setValeurAna('');
  };

  const triggerEditRow = (index: number) => {
    const row = analysesSaisies[index];
    setSelectedExamen(row.resultatAna);
    setDateAna(row.dateAna);
    setValeurAna(row.valeurAna);
    setUniteAna(row.uniteAna || '');
    setEditingAnalysisIndex(index);
  };

  const handleRemoveAnalysisRow = (index: number) => {
    setAnalysesSaisies(analysesSaisies.filter((_, i) => i !== index));
    if (editingAnalysisIndex === index) {
      setEditingAnalysisIndex(null);
      setValeurAna('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const payload: any = {
      libelleBCS,
      descriptionBCS,
      analyses: analysesSaisies,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (isDonorMode) {
        await axios.post(`http://localhost:8081/api/biochimie-sanguine/donneur/${selectedPatientId}`, payload);
      } else {
        await saveMutation.mutateAsync({ patientId: patientIdString, data: payload });
      }

      setToastType('success');
      setToastMessage("La fiche de biochimie sanguine a été enregistrée avec succès !");
      setToastOpen(true);
      
      queryClient.invalidateQueries({ queryKey: ['bloodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorBloodHistory'] });
    } catch {
      setToastType('error');
      setToastMessage("Erreur lors de l'enregistrement de la fiche.");
      setToastOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!blood?.identifiantBCS) return;
    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/biochimie-sanguine/${blood.identifiantBCS}`);
      } else {
        await deleteMutation.mutateAsync(blood.identifiantBCS);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Fiche de biochimie sanguine supprimée.");
      setToastOpen(true);
      
      setLibelleBCS("Biochimie Sanguine");
      setDescriptionBCS('');
      setAnalysesSaisies([]);
      setEditingAnalysisIndex(null);

      queryClient.removeQueries({ queryKey: ['bloodHistory'] });
      queryClient.removeQueries({ queryKey: ['donorBloodHistory'] });
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
      datasetToExport = analysesSaisies || [];
      filename = `export_biochimie_sanguine_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await bloodService.getAll();
        datasetToExport = globalData || [];
        filename = `export_global_biochimie_sanguine_cohorte_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune analyse à exporter.");
      return;
    }

    let csvContent = "";
    if (mode === 'personal') {
      const headers = ["dateAna", "resultatAna", "valeurAna", "uniteAna"];
      const csvRows = datasetToExport.map(row => [
        row.dateAna || "",
        `"${String(row.resultatAna || '').replace(/"/g, '""')}"`,
        `"${String(row.valeurAna || '').replace(/"/g, '""')}"`,
        row.uniteAna || ''
      ].join(";"));
      csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    } else {
      const headers = ["patientId", "libelleBCS", "descriptionBCS", "dateAna", "resultatAna", "valeurAna", "uniteAna"];
      const csvRows: string[] = [];
      datasetToExport.forEach(bs => {
        const patientId = bs.patientId || bs.patient?.identifiantP || "";
        const lib = bs.libelleBCS || "Biochimie Sanguine";
        const desc = bs.descriptionBCS || "";
        
        if (bs.analyses && bs.analyses.length > 0) {
          bs.analyses.forEach((a: any) => {
            csvRows.push([
              patientId, `"${lib.replace(/"/g, '""')}"`, `"${desc.replace(/"/g, '""')}"`,
              a.dateAna || "", `"${a.resultatAna.replace(/"/g, '""')}"`, `"${a.valeurAna.replace(/"/g, '""')}"`,
              a.uniteAna || ""
            ].join(";"));
          });
        } else {
          csvRows.push([patientId, `"${lib.replace(/"/g, '""')}"`, `"${desc.replace(/"/g, '""')}"`, "", "", "", ""].join(";"));
        }
      });
      csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    }

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
      ? ["patientId", "libelleBCS", "descriptionBCS", "dateAna", "resultatAna", "valeurAna", "uniteAna"]
      : ["dateAna", "resultatAna", "valeurAna", "uniteAna"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_blood_global.csv" : "modele_import_blood_personnel.csv";
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

    if (importMode === 'personal') {
      const nouvellesAnalyses = [...analysesSaisies];
      previewData.forEach(row => {
        nouvellesAnalyses.push({
          dateAna: row.dateAna || new Date().toISOString().split('T')[0],
          resultatAna: row.resultatAna || listExamensSang[0],
          valeurAna: row.valeurAna || '',
          uniteAna: row.uniteAna || 'mmol/L',
          typeAnalyse: 'BIOCHIMIE_SANG'
        });
      });
      setAnalysesSaisies(nouvellesAnalyses);
      successCount = previewData.length;
      setToastMessage(`${successCount} lignes d'analyses ajoutées au tableau local.`);
    } else {
      const mappedGroups: { [key: string]: any } = {};
      previewData.forEach(row => {
        const pid = row.patientId;
        if (!pid) return;
        if (!mappedGroups[pid]) {
          mappedGroups[pid] = {
            libelleBCS: row.libelleBCS || "Biochimie Sanguine",
            descriptionBCS: row.descriptionBCS || '',
            analyses: []
          };
        }
        if (row.dateAna && row.valeurAna) {
          mappedGroups[pid].analyses.push({
            dateAna: row.dateAna,
            resultatAna: row.resultatAna || listExamensSang[0],
            valeurAna: row.valeurAna,
            uniteAna: row.uniteAna || 'mmol/L',
            typeAnalyse: 'BIOCHIMIE_SANG'
          });
        }
      });

      for (const [pid, data] of Object.entries(mappedGroups)) {
        try {
          await bloodService.save(pid, data);
          successCount++;
        } catch (err) {
          console.error("Erreur import global :", err);
        }
      }
      setToastMessage(`${successCount} fiche(s) de biochimie de cohorte importée(s) !`);
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['bloodHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorBloodHistory'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION DU PATIENT AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconFlask size={24} className="text-[#2B5296] animate-pulse" />
            Fiche de Biochimie Sanguine
          </h2>
          
          {/* ACTIONS GLOBALES DE L'ETAT A */}
          {!selectedPatientId && (
            <div className="flex gap-2">
              <button 
                onClick={() => { setImportMode('global'); setIsImportOpen(true); }}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <IconDatabaseImport size={16} /> Import de Cohorte
              </button>
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
                {isDonorMode ? 'Donneur Actif' : 'Patient Actif'} : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`}
              </span>
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                Fermer le dossier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- ÉTAT A : VUE COHORTE (AUCUN PATIENT SÉLECTIONNÉ) --- */}
      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">
              {isDonorMode ? "Registre de Biochimie Sanguine de la Cohorte Donneurs" : "Registre de Biochimie Sanguine de la Cohorte Patients"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold">
              {isDonorMode ? "Consultez et complétez les analyses biochimiques sanguines de vos donneurs." : "Consultez et complétez les analyses biochimiques sanguines de vos patients."}
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
              <p className="font-semibold">Aucun dossier patient actif rattaché à votre profil.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {/* Formulaire à gauche */}
          <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit space-y-6">
            <h3 className="text-base font-bold text-[#2B5296]">Saisie du Bilan Sanguin</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Libellé de la fiche *</label>
                <input type="text" value={libelleBCS} onChange={(e) => setLibelleBCS(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Observations</label>
                <textarea value={descriptionBCS} onChange={(e) => setDescriptionBCS(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs resize-none bg-white outline-none" placeholder="Remarques cliniques..." />
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="text-[10px] font-black text-[#2B5296] uppercase mb-2">
                  {editingAnalysisIndex !== null ? "Modification de la Ligne" : "Saisie des Résultats"}
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Examen *</label>
                    <select value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white font-bold text-[#2B5296]">
                      {listExamensSang.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Date *</label>
                    <input type="date" value={dateAna} onChange={(e) => setDateAna(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Résultat (Valeur) *</label>
                    <input type="text" value={valeurAna} onChange={(e) => setValeurAna(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white outline-none" placeholder="Ex: 85, 1.2..." />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Unité *</label>
                    <select value={uniteAna} onChange={(e) => setUniteAna(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white font-bold text-[#2B5296]">
                      {(dictUnites[selectedExamen] || ["-"]).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={handleAddAnalysisRow} className="w-full bg-[#2B5296] text-white py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-blue-900 mt-2">
                  {editingAnalysisIndex !== null ? "Enregistrer la Modification" : "Ajouter au Tableau"}
                </button>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {blood?.identifiantBCS && (
                  <button type="button" onClick={() => setConfirmOpen(true)} className="w-1/3 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-red-100 flex items-center justify-center gap-1"><IconTrash size={14} /> Supprimer</button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                  Sauvegarder la Fiche
                </button>
              </div>
            </form>
          </div>

          {/* Tableau de résultats à droite */}
          <div className="lg:col-span-2 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconFlask size={22} className="text-[#2B5296]" />
                    Registre de Biochimie Sanguine ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par analyse..." 
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => { setImportMode('personal'); setIsImportOpen(true); }}
                    className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Importer pour ce patient"
                  >
                    <IconDatabaseImport size={16} />
                  </button>
                  <button 
                    onClick={() => handleExportCSV('personal')}
                    className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Exporter cet historique"
                  >
                    <IconFileSpreadsheet size={16} />
                  </button>
                </div>
              </div>

              {/* Synthèse Observations */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100/50">
                <div className="text-xs text-slate-600 col-span-2">
                  <p>Observations : <strong className="text-slate-800 italic">"{descriptionBCS || 'Aucune observation enregistrée.'}"</strong></p>
                </div>
              </div>

              {/* Tableau principal */}
              {loadingBlood ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : (
                <div className="border border-slate-100 rounded-[20px] overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b">
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Examen (Analyse)</th>
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Résultat (Valeur + Unité)</th>
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLocalAnalyses.length > 0 ? (
                        filteredLocalAnalyses.map((row, idx) => {
                          const isAbnormal = checkIfPathological(row.resultatAna, row.valeurAna, row.uniteAna);

                          return (
                            <tr key={idx} className={`hover:bg-slate-50/50 ${isAbnormal ? 'bg-red-50/10' : ''}`}>
                              <td className="px-4 py-3 font-medium text-slate-600">{row.dateAna}</td>
                              <td className="px-4 py-3 font-bold text-[#2B5296]">{row.resultatAna}</td>
                              <td className={`px-4 py-3 font-extrabold ${isAbnormal ? 'text-red-600' : 'text-slate-800'}`}>
                                {row.valeurAna}{' '}
                                <span className={`text-[10px] font-semibold ml-1 ${isAbnormal ? 'text-red-500' : 'text-slate-400'}`}>
                                  {row.uniteAna}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => triggerEditRow(idx)} type="button" className="p-1 hover:bg-[#DCE6F5]/50 text-[#006591] rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={14} /></button>
                                  <button onClick={() => handleRemoveAnalysisRow(idx)} type="button" className="p-1 hover:bg-red-50 text-red-500 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-semibold">Aucun résultat d'analyse saisi ne correspond à vos critères.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
              * Une fois les lignes ajoutées au tableau local, n'oubliez pas de cliquer sur "Sauvegarder la Fiche" en bas à gauche pour enregistrer définitivement le bilan de biochimie complet du patient.
            </div>
          </div>

        </div>
      )}

      {/* --- MODAL UNIQUE D'IMPORTATION CLINIQUE (GLOBAL OU PERSONNEL) --- */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-[#2B5296]">
                {importMode === 'global' ? "Importation de Cohorte Biochimique (CSV)" : `Importer les analyses de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      {/* --- MODAL CONFIRMATION SUPPRESSION --- */}
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la fiche de biochimie ?" message="Cette action effacera définitivement l'intégralité du bilan de biochimie sanguine ainsi que toutes les lignes de résultats associées." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};