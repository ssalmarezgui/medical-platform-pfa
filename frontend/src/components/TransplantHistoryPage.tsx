import { useState, useRef, useEffect } from 'react';
import { useTransplantHistory, useCreateTransplant, useDeleteTransplant } from '../features/transplants/hooks/useTransplants';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { transplantService } from '../features/transplants/api/transplantService';
import { 
  IconHeartbeat, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconBuildingHospital, IconStethoscope, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

export const TransplantHistoryPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  // Récupération des greffes
  const { data: transplants, isLoading: loadingTransplants } = useTransplantHistory(patientIdString || undefined);
  const createMutation = useCreateTransplant();
  const deleteMutation = useDeleteTransplant(patientIdString);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const optionsInduction = ["Corticoïdes", "Anticorps polyclonaux", "Anticorps anti-CD25", "Anticorps monoclonal anti-CD3", "Autres"];
  const optionsEntretien = ["Corticoïdes", "Azathioprine", "MMF", "Ciclosporine", "Tacrolimus", "Rapamune", "Autres"];

  // États du formulaire
  const [dateTR, setDateTR] = useState('');
  const [lieuTR, setLieuTR] = useState('');
  const [lieuSuiviTR, setLieuSuiviTR] = useState('');
  const [typeDonneur, setTypeDonneur] = useState('');
  const [hlaDonneur, setHlaDonneur] = useState('');
  
  const [induction, setInduction] = useState<string[]>([]);
  const [entretien, setEntretien] = useState<string[]>([]);
  
  const [causePerte, setCausePerte] = useState('');
  const [dateRetourDialyse, setDateRetourDialyse] = useState('');
  const [transplantectomie, setTransplantectomie] = useState(false);
  const [transplantectomieIndication, setTransplantectomieIndication] = useState('');

  // Édition
  const [selectedTransplant, setSelectedTransplant] = useState<any | null>(null);

  // CONFIGURATION MODALS & TOASTS
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // ÉTATS IMPORTATION
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtrage cohorte (Vue Globale)
  const filteredPatients = patients?.filter(p => {
    const nomComplet = `${p.prenomP} ${p.nomP}`.toLowerCase();
    return nomComplet.includes(patientSearch.toLowerCase()) || String(p.identifiantP) === patientSearch;
  });

  // Filtrage local des greffes (Vue Personnelle)
  const filteredTransplants = transplants?.filter(tr => {
    const placeStr = tr.lieuTR?.toLowerCase() || '';
    const donorStr = tr.typeDonneur?.toLowerCase() || '';
    const hlaStr = tr.hlaDonneur?.toLowerCase() || '';
    const indStr = tr.traitementImmunoSuppresseurInduction?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return placeStr.includes(query) || donorStr.includes(query) || hlaStr.includes(query) || indStr.includes(query);
  }) || [];

  const selectedPatient = patients?.find(p => p.identifiantP === selectedPatientId);

  // Cases à cocher
  const handleCheckboxChange = (value: string, type: 'induction' | 'entretien') => {
    if (type === 'induction') {
      setInduction(induction.includes(value) ? induction.filter(v => v !== value) : [...induction, value]);
    } else {
      setEntretien(entretien.includes(value) ? entretien.filter(v => v !== value) : [...entretien, value]);
    }
  };

  const resetForm = () => {
    setSelectedTransplant(null);
    setDateTR('');
    setLieuTR('');
    setLieuSuiviTR('');
    setTypeDonneur('');
    setHlaDonneur('');
    setInduction([]);
    setEntretien([]);
    setCausePerte('');
    setDateRetourDialyse('');
    setTransplantectomie(false);
    setTransplantectomieIndication('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !dateTR || !lieuTR) return;

    const payload = {
      dateTR,
      lieuTR,
      lieuSuiviTR: lieuSuiviTR || 'Non précisé',
      typeDonneur: typeDonneur || 'Non précisé',
      hlaDonneur: hlaDonneur || 'Non précisé',
      traitementImmunoSuppresseurInduction: induction.join(', ') || 'Aucun',
      traitementImmunoSuppresseurEntretien: entretien.join(', ') || 'Aucun',
      causePerteGreffonRenale: causePerte || 'Non précisée',
      dateRetourDialyse: dateRetourDialyse || undefined,
      transplantectomie: !!transplantectomie,
      transplantectomieIndication: transplantectomie ? transplantectomieIndication : '',
      patientId: patientIdString,
    };

    try {
      if (selectedTransplant) {
        await transplantService.update(selectedTransplant.identifiantTR, payload);
        setToastMessage("Dossier de greffe mis à jour !");
      } else {
        await createMutation.mutateAsync({ patientId: patientIdString, data: payload });
        setToastMessage("Dossier de transplantation enregistré !");
      }

      setToastType('success');
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: ['transplantHistory', patientIdString] });
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (tr: any) => {
    setSelectedTransplant(tr);
    setDateTR(tr.dateTR);
    setLieuTR(tr.lieuTR);
    setLieuSuiviTR(tr.lieuSuiviTR);
    setTypeDonneur(tr.typeDonneur);
    setHlaDonneur(tr.hlaDonneur);
    setInduction(tr.traitementImmunoSuppresseurInduction ? tr.traitementImmunoSuppresseurInduction.split(', ') : []);
    setEntretien(tr.traitementImmunoSuppresseurEntretien ? tr.traitementImmunoSuppresseurEntretien.split(', ') : []);
    setCausePerte(tr.causePerteGreffonRenale);
    setDateRetourDialyse(tr.dateRetourDialyse || '');
    setTransplantectomie(tr.transplantectomie);
    setTransplantectomieIndication(tr.transplantectomieIndication || '');
  };

  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      await deleteMutation.mutateAsync(idToDelete);
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Registre supprimé.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur de suppression.");
      setToastOpen(true);
    }
  };

  // --- EXPORT CSV (DOUBLES FLUX) ---
  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = transplants || [];
      filename = `export_greffes_patient_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await transplantService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_greffes_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune greffe antérieure à exporter.");
      return;
    }

    const headers = ["identifiantTR", "patientId", "dateTR", "lieuTR", "lieuSuiviTR", "typeDonneur", "hlaDonneur", "traitementImmunoSuppresseurInduction", "traitementImmunoSuppresseurEntretien", "causePerteGreffonRenale", "dateRetourDialyse", "transplantectomie", "transplantectomieIndication"];
    const csvRows = datasetToExport.map(tr => [
      tr.identifiantTR || "",
      tr.patientId || tr.patient?.identifiantP || "",
      tr.dateTR || "",
      `"${String(tr.lieuTR || '').replace(/"/g, '""')}"`,
      `"${String(tr.lieuSuiviTR || '').replace(/"/g, '""')}"`,
      `"${String(tr.typeDonneur || '').replace(/"/g, '""')}"`,
      `"${String(tr.hlaDonneur || '').replace(/"/g, '""')}"`,
      `"${String(tr.traitementImmunoSuppresseurInduction || '').replace(/"/g, '""')}"`,
      `"${String(tr.traitementImmunoSuppresseurEntretien || '').replace(/"/g, '""')}"`,
      `"${String(tr.causePerteGreffonRenale || '').replace(/"/g, '""')}"`,
      tr.dateRetourDialyse || "",
      tr.transplantectomie ? "true" : "false",
      `"${String(tr.transplantectomieIndication || '').replace(/"/g, '""')}"`
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

  // --- IMPORT CSV (DOUBLES FLUX) ---
  const handleDownloadTemplate = (mode: 'global' | 'personal') => {
    const headers = mode === 'global' 
      ? ["patientId", "dateTR", "lieuTR", "lieuSuiviTR", "typeDonneur", "hlaDonneur", "traitementImmunoSuppresseurInduction", "traitementImmunoSuppresseurEntretien", "causePerteGreffonRenale", "dateRetourDialyse", "transplantectomie", "transplantectomieIndication"]
      : ["dateTR", "lieuTR", "lieuSuiviTR", "typeDonneur", "hlaDonneur", "traitementImmunoSuppresseurInduction", "traitementImmunoSuppresseurEntretien", "causePerteGreffonRenale", "dateRetourDialyse", "transplantectomie", "transplantectomieIndication"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_greffes_global.csv" : "modele_import_greffes_personnel.csv";
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
          dateTR: row.dateTR,
          lieuTR: row.lieuTR,
          lieuSuiviTR: row.lieuSuiviTR || 'Non précisé',
          typeDonneur: row.typeDonneur || 'Non précisé',
          hlaDonneur: row.hlaDonneur || 'Non précisé',
          traitementImmunoSuppresseurInduction: row.traitementImmunoSuppresseurInduction || 'Aucun',
          traitementImmunoSuppresseurEntretien: row.traitementImmunoSuppresseurEntretien || 'Aucun',
          causePerteGreffonRenale: row.causePerteGreffonRenale || 'Non précisée',
          dateRetourDialyse: row.dateRetourDialyse || undefined,
          transplantectomie: row.transplantectomie === 'true',
          transplantectomieIndication: row.transplantectomieIndication || ''
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await transplantService.create(targetPatientId, payload);
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
    
    setToastMessage(`${successCount} transplantation(s) antérieure(s) importée(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['transplantHistory', patientIdString] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION DU PATIENT AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Registre de Transplantation Rénale Antérieure
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
              placeholder="Rechercher par nom ou par identifiant unique (ID)..."
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
              <span className="text-xs font-bold text-[#2B5296]">Patient : {selectedPatient.prenomP} {selectedPatient.nomP}</span>
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
            <h3 className="text-base font-bold text-slate-800">Votre cohorte d'historique de transplantations</h3>
            <p className="text-[#6588BB] text-xs mt-0.5">Ouvrez le dossier d'un patient pour évaluer ses antécédents de greffe.</p>
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
        
        // --- ÉTAT B : VUE CLINIQUE PERSONNELLE (PATIENT SÉLECTIONNÉ) ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {/* Formulaire à gauche */}
          <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
            <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
              <IconPlus size={20} /> {selectedTransplant ? "Modifier la Greffe" : "Saisir une Greffe"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date de transplantation *</label>
                  <input type="date" value={dateTR} onChange={(e) => setDateTR(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu de greffe *</label>
                  <input type="text" value={lieuTR} onChange={(e) => setLieuTR(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu de suivi</label>
                  <input type="text" value={lieuSuiviTR} onChange={(e) => setLieuSuiviTR(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type Donneur</label>
                  <input type="text" value={typeDonneur} onChange={(e) => setTypeDonneur(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">HLA du Donneur</label>
                <input type="text" value={hlaDonneur} onChange={(e) => setHlaDonneur(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
              </div>

              {/* Traitement Induction */}
              <div className="border-t pt-3">
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Traitement d'induction</label>
                <div className="grid grid-cols-2 gap-2">
                  {optionsInduction.map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={induction.includes(opt)} onChange={() => handleCheckboxChange(opt, 'induction')} className="rounded border-slate-200" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Traitement Entretien */}
              <div className="border-t pt-3">
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Traitement d'entretien</label>
                <div className="grid grid-cols-2 gap-2">
                  {optionsEntretien.map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={entretien.includes(opt)} onChange={() => handleCheckboxChange(opt, 'entretien')} className="rounded border-slate-200" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rejet & Dialyse */}
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Cause de la perte de greffon</label>
                  <input type="text" value={causePerte} onChange={(e) => setCausePerte(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" placeholder="Raison médicale..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date de retour en dialyse</label>
                  <input type="date" value={dateRetourDialyse} onChange={(e) => setDateRetourDialyse(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                </div>
              </div>

              {/* Transplantectomie */}
              <div className="border-t pt-3">
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Transplantectomie *</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" checked={transplantectomie === false} onChange={() => setTransplantectomie(false)} /> Non
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" checked={transplantectomie === true} onChange={() => setTransplantectomie(true)} /> Oui
                  </label>
                </div>
                {transplantectomie && (
                  <input type="text" value={transplantectomieIndication} onChange={(e) => setTransplantectomieIndication(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white" placeholder="Indiquez l'indication..." />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {selectedTransplant && (
                  <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                  {selectedTransplant ? "Sauvegarder" : "Enregistrer la Greffe"}
                </button>
              </div>
            </form>
          </div>

          {/* Registre à droite */}
          <div className="lg:col-span-2 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconHeartbeat size={22} className="text-[#2B5296]" />
                    Registre Historique des Transplantations Rénales ({selectedPatient?.prenomP} {selectedPatient?.nomP})
                  </h3>
                </div>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par lieu de greffe..." 
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

              {loadingTransplants ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredTransplants && filteredTransplants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTransplants.map((tr) => (
                    <div key={tr.identifiantTR} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase truncate max-w-[200px]">
                            Greffe : {tr.dateTR}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tr.transplantectomie ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            Transplantectomie : {tr.transplantectomie ? "Oui" : "Non"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          <p className="flex items-center gap-1.5"><IconBuildingHospital size={14} /> Lieu : <strong>{tr.lieuTR}</strong> (Suivi: {tr.lieuSuiviTR})</p>
                          <p>Donneur : <strong>{tr.typeDonneur}</strong> (HLA: {tr.hlaDonneur})</p>
                          <p className="text-[#006591]"><strong>Induction :</strong> {tr.traitementImmunoSuppresseurInduction}</p>
                          <p className="text-purple-600"><strong>Entretien :</strong> {tr.traitementImmunoSuppresseurEntretien}</p>
                          {tr.causePerteGreffonRenale && <p className="text-red-600"><strong>Perte greffon :</strong> {tr.causePerteGreffonRenale}</p>}
                          {tr.dateRetourDialyse && <p className="text-red-500">Retour dialyse : {tr.dateRetourDialyse}</p>}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                        <button onClick={() => triggerEdit(tr)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={16} /></button>
                        <button onClick={() => triggerDelete(tr.identifiantTR!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucune transplantation rénale antérieure enregistrée pour ce patient.</p>
                </div>
              )}
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
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer les greffes de ${selectedPatient?.prenomP}`}
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
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la greffe ?" message="Cette action effacera définitivement cette transplantation du registre clinique du patient." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};