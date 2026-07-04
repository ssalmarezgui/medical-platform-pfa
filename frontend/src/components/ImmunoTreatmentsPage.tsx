import { useState, useRef, useEffect } from 'react';
import { useImmunoHistory, useMedicaments, usePrescriptions, useDosages } from '../features/immuno-treatments/hooks/useImmuno';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { immunoService } from '../features/immuno-treatments/api/immunoService';
import { 
  IconPill, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconEdit, IconLoader, IconHeartbeat, IconActivity, IconInfoCircle,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconDownload, IconFolderOpen,
  IconFlask
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import axios from 'axios';
import { usePermission } from '../hooks/usePermission';
import { useAuthStore } from '../store/useAuthStore';

export const ImmunoTreatmentsPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();
  
  // --- ÉTATS DE SÉLECTION DU PATIENT ---
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';

  // Appels API
  const { data: treatments, isLoading: loadingHistory } = useImmunoHistory(patientIdString || undefined);
  const { data: listMeds } = useMedicaments();

  // --- HABILITATIONS & SÉCURITÉ ---
  const { hasPermission } = usePermission();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.roleU;
  
  // Prise en charge des rôles avec ou sans le préfixe "ROLE_"
  const isSuivi = userRole === 'ROLE_MEDECIN_SUIVI' || userRole === 'MEDECIN_SUIVI';
  const isImmuno = userRole === 'ROLE_AGENT_IMMUNO' || userRole === 'AGENT_IMMUNO';
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

  const canAccess = isSuivi || isImmuno || isAdmin;
  const isReadOnly = isAdmin;
  const canDelete = isSuivi; // Seul le médecin de suivi peut supprimer (CRUD complet)

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter le pôle de traitement immunosuppresseur.
      </div>
    );
  }

  // --- RECHERCHE LOCALE (Vue Personnelle) ---
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // États du formulaire principal (Traitement Maître)
  const [typeTIS, setTypeTIS] = useState<'INDUCTION' | 'ENTRETIEN'>('INDUCTION');
  const [dciTIS, setDciTIS] = useState('');
  const [durerTraitementTIS, setDurerTraitementTIS] = useState('');

  // Molécules cochées (Héritage)
  const [grafalonTISI, setGrafalonTISI] = useState(false);
  const [atgTISI, setAtgTISI] = useState(false);
  const [tymoglobulineTISI, setTymoglobulineTISI] = useState(false);
  const [simulectTISI, setSimulectTISI] = useState(false);

  const [mmfTISE, setMmfTISE] = useState(false);
  const [azathioprineTISE, setAzathioprineTISE] = useState(false);
  const [cyclusporineTISE, setCyclusporineTISE] = useState(false);
  const [tacrolimusTISE, setTacrolimusTISE] = useState(false);
  const [prednisoleTISE, setPrednisoleTISE] = useState(false);
  const [prednisoluneTISE, setPrednisoluneTISE] = useState(false);
  const [sirolimus, setSirolimus] = useState(false);

  // États pour les sous-formulaires (Prescriptions & Dosages)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | null>(null);
  const { data: prescriptions } = usePrescriptions(selectedTreatmentId || undefined);
  const { data: dosages } = useDosages(selectedTreatmentId || undefined);

  // Saisie prescription
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [datePremierePrise, setDatePremierePrise] = useState('');
  const [dosageMed, setDosageMed] = useState('');

  // Saisie dosage sanguin
  const [dateDMS, setDateDMS] = useState('');
  const [labelDMS, setLabelDMS] = useState('T0 - Taux résiduel');
  const [valeurDMS, setValeurDMS] = useState('');

  // --- ÉTATS POUR LES EFFETS SECONDAIRES ---
  const [effetsSecondaires, setEffetsSecondaires] = useState<any[]>([]);
  const [effetModalOpen, setEffetModalOpen] = useState(false);
  const [targetPrescription, setTargetPrescription] = useState<any | null>(null);
  const [inputLibelleEFS, setInputLibelleEFS] = useState('');
  const [inputDescriptionEFS, setInputDescriptionEFS] = useState('');
  const [inputRecommendationEFS, setInputRecommendationEFS] = useState('');

  // TOASTS & SUPPRESSION
  const [selectedTIS, setSelectedTIS] = useState<any | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'TIS' | 'PRESCRIPTION' | 'DOSAGE'>('TIS');

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

  // Filtrage local des immunosuppresseurs (Vue Personnelle)
  const filteredLocalTreatments = treatments?.filter(t => {
    const nameStr = t.dciTIS?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();
    return nameStr.includes(query);
  }) || [];

  const selectedPatient = patients?.find(p => p.identifiantP === selectedPatientId);

  // Remplissage automatique
  useEffect(() => {
    if (selectedTIS) {
      setTypeTIS(selectedTIS.typeTIS);
      setDciTIS(selectedTIS.dciTIS);
      setDurerTraitementTIS(selectedTIS.durerTraitementTIS);
      if (selectedTIS.typeTIS === 'INDUCTION') {
        setGrafalonTISI(!!selectedTIS.grafalonTISI);
        setAtgTISI(!!selectedTIS.atgTISI);
        setTymoglobulineTISI(!!selectedTIS.tymoglobulineTISI);
        setSimulectTISI(!!selectedTIS.simulectTISI);
      } else {
        setMmfTISE(!!selectedTIS.mmfTISE);
        setAzathioprineTISE(!!selectedTIS.azathioprineTISE);
        setCyclusporineTISE(!!selectedTIS.cyclusporineTISE);
        setTacrolimusTISE(!!selectedTIS.tacrolimusTISE);
        setPrednisoleTISE(!!selectedTIS.prednisoleTISE);
        setPrednisoluneTISE(!!selectedTIS.prednisoluneTISE);
        setSirolimus(!!selectedTIS.sirolimus);
      }
    }
  }, [selectedTIS]);

  const resetForm = () => {
    setSelectedTIS(null);
    setDciTIS('');
    setDurerTraitementTIS('');
    setGrafalonTISI(false); setAtgTISI(false); setTymoglobulineTISI(false); setSimulectTISI(false);
    setMmfTISE(false); setAzathioprineTISE(false); setCyclusporineTISE(false); setTacrolimusTISE(false);
    setPrednisoleTISE(false); setPrednisoluneTISE(false); setSirolimus(false);
  };

  const handleSaveTIS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !dciTIS) return;

    const payload: any = {
      dciTIS,
      durerTraitementTIS,
      typeTIS,
      patientId: patientIdString,
      patient: { identifiantP: patientIdString }
    };

    if (typeTIS === 'INDUCTION') {
      payload.grafalonTISI = grafalonTISI;
      payload.atgTISI = atgTISI;
      payload.tymoglobulineTISI = tymoglobulineTISI;
      payload.simulectTISI = simulectTISI;
    } else {
      payload.mmfTISE = mmfTISE;
      payload.azathioprineTISE = azathioprineTISE;
      payload.cyclusporineTISE = cyclusporineTISE;
      payload.tacrolimusTISE = tacrolimusTISE;
      payload.prednisoleTISE = prednisoleTISE;
      payload.prednisoluneTISE = prednisoluneTISE;
      payload.sirolimus = sirolimus;
    }

    try {
      if (selectedTIS) {
        await axios.put(`http://localhost:8081/api/traitements-immuno/${selectedTIS.identifiantTIS}`, payload);
        setToastMessage("Le protocole d'immuno-suppression a été mis à jour !");
      } else {
        await immunoService.createTIS(payload);
        setToastMessage("Dossier d'immuno-suppression enregistré !");
      }

      setToastType('success');
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: ['immunoHistory', patientIdString] });
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTreatmentId) {
      alert("Veuillez d'abord sélectionner un protocole de fond actif.");
      return;
    }
    if (!selectedMedId) {
      alert("Veuillez sélectionner une molécule dans la liste.");
      return;
    }
    if (!datePremierePrise) {
      alert("Veuillez renseigner la date de première prise.");
      return;
    }

    try {
      await immunoService.createPrescription(selectedTreatmentId, selectedMedId, {
        datePremierePrise,
        dosageMed,
        traitementId: selectedTreatmentId,
        medicamentId: selectedMedId
      });
      queryClient.invalidateQueries({ queryKey: ['prescriptions', selectedTreatmentId] });
      setDatePremierePrise('');
      setDosageMed('');
      setSelectedMedId(null);
      
      setToastMessage("Prescription enregistrée avec succès !");
      setToastType('success');
      setToastOpen(true);
    } catch {
      setToastMessage("Erreur lors de la prescription.");
      setToastType('error');
      setToastOpen(true);
    }
  };

  const handleAddDosage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTreatmentId || !dateDMS || !valeurDMS) return;

    try {
      await immunoService.createDosage(selectedTreatmentId, {
        dateDMS,
        labelDMS,
        valeurDMS,
        traitementId: selectedTreatmentId
      });
      queryClient.invalidateQueries({ queryKey: ['dosages', selectedTreatmentId] });
      setValeurDMS('');
    } catch {
      alert("Erreur d'enregistrement du dosage.");
    }
  };

  const triggerAddEffetSecondaire = (prescription: any) => {
    setTargetPrescription(prescription);
    setInputLibelleEFS('');
    setInputDescriptionEFS('');
    setInputRecommendationEFS('');
    setEffetModalOpen(true);
  };

  const handleSaveEffetSecondaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrescription || !inputLibelleEFS) return;

    const nouvelEffet = {
      identifiantEFS: Date.now(),
      prescriptionId: targetPrescription.identifiantPrescription,
      libelleEFS: inputLibelleEFS,
      descriptionEFS: inputDescriptionEFS,
      recommendationEFS: inputRecommendationEFS || "Aucune consigne spécifique"
    };

    setEffetsSecondaires((prev) => [...prev, nouvelEffet]);
    setEffetModalOpen(false);
    setTargetPrescription(null);

    setToastMessage("Effet secondaire consigné avec succès !");
    setToastType('success');
    setToastOpen(true);
  };

  const triggerDelete = (id: number, type: 'TIS' | 'PRESCRIPTION' | 'DOSAGE') => {
    setIdToDelete(id);
    setDeleteType(type);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      if (deleteType === 'TIS') {
        await axios.delete(`http://localhost:8081/api/traitements-immuno/${idToDelete}`);
        queryClient.invalidateQueries({ queryKey: ['immunoHistory', patientIdString] });
        setSelectedTreatmentId(null);
      } else if (deleteType === 'PRESCRIPTION') {
        await immunoService.deletePrescription(idToDelete);
        queryClient.invalidateQueries({ queryKey: ['prescriptions', selectedTreatmentId] });
      } else {
        await immunoService.deleteDosage(idToDelete);
        queryClient.invalidateQueries({ queryKey: ['dosages', selectedTreatmentId] });
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Élément supprimé avec succès !");
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
      datasetToExport = treatments || [];
      filename = `export_traitements_immuno_patient_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await immunoService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_traitements_immuno_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun protocole à exporter.");
      return;
    }

    const headers = ["identifiantTIS", "patientId", "typeTIS", "dciTIS", "durerTraitementTIS", "grafalonTISI", "atgTISI", "tymoglobulineTISI", "simulectTISI", "mmfTISE", "azathioprineTISE", "cyclusporineTISE", "tacrolimusTISE", "prednisoleTISE", "prednisoluneTISE", "sirolimus"];
    const csvRows = datasetToExport.map(t => [
      t.identifiantTIS || "",
      t.patientId || t.patient?.identifiantP || "",
      t.typeTIS || "INDUCTION",
      `"${String(t.dciTIS || '').replace(/"/g, '""')}"`,
      `"${String(t.durerTraitementTIS || '').replace(/"/g, '""')}"`,
      t.grafalonTISI ? "true" : "false",
      t.atgTISI ? "true" : "false",
      t.tymoglobulineTISI ? "true" : "false",
      t.simulectTISI ? "true" : "false",
      t.mmfTISE ? "true" : "false",
      t.azathioprineTISE ? "true" : "false",
      t.cyclusporineTISE ? "true" : "false",
      t.tacrolimusTISE ? "true" : "false",
      t.prednisoleTISE ? "true" : "false",
      t.prednisoluneTISE ? "true" : "false",
      t.sirolimus ? "true" : "false"
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
      ? ["patientId", "typeTIS", "dciTIS", "durerTraitementTIS", "grafalonTISI", "atgTISI", "tymoglobulineTISI", "simulectTISI", "mmfTISE", "azathioprineTISE", "cyclusporineTISE", "tacrolimusTISE", "prednisoleTISE", "prednisoluneTISE", "sirolimus"]
      : ["typeTIS", "dciTIS", "durerTraitementTIS", "grafalonTISI", "atgTISI", "tymoglobulineTISI", "simulectTISI", "mmfTISE", "azathioprineTISE", "cyclusporineTISE", "tacrolimusTISE", "prednisoleTISE", "prednisoluneTISE", "sirolimus"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_immuno_global.csv" : "modele_import_immuno_personnel.csv";
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
          typeTIS: row.typeTIS || 'INDUCTION',
          dciTIS: row.dciTIS,
          durerTraitementTIS: row.durerTraitementTIS || 'Non spécifiée',
          grafalonTISI: row.grafalonTISI === 'true',
          atgTISI: row.atgTISI === 'true',
          tymoglobulineTISI: row.tymoglobulineTISI === 'true',
          simulectTISI: row.simulectTISI === 'true',
          mmfTISE: row.mmfTISE === 'true',
          azathioprineTISE: row.azathioprineTISE === 'true',
          cyclusporineTISE: row.cyclusporineTISE === 'true',
          tacrolimusTISE: row.tacrolimusTISE === 'true',
          prednisoleTISE: row.prednisoleTISE === 'true',
          prednisoluneTISE: row.prednisoluneTISE === 'true',
          sirolimus: row.sirolimus === 'true',
          patientId: importMode === 'global' ? row.patientId : patientIdString,
          patient: { identifiantP: importMode === 'global' ? row.patientId : patientIdString }
        };

        if (payload.patientId) {
          await immunoService.createTIS(payload as any);
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
    
    setToastMessage(`${successCount} protocole(s) d'immuno-suppression importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['immunoHistory', patientIdString] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION DU PATIENT AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Bilan Thérapeutique d'Immuno-suppression
          </h2>
          
          {/* ACTIONS GLOBALES DE L'ETAT A */}
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
              placeholder="Rechercher par nom"
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
                    setSelectedTreatmentId(null);
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
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); setSelectedTreatmentId(null); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
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
            <h3 className="text-base font-bold text-slate-800">Registre Thérapeutique de la Cohorte</h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold font-sans">Visualisez et gérez les protocoles d'immuno-suppression actifs de vos patients transplantés.</p>
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
          
          {/* Formulaire à gauche - Affiché pour Médecin Suivi et Agent Immuno (CRU) */}
          {!isReadOnly && (
            <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit space-y-6">
              <h3 className="text-base font-bold text-[#2B5296] flex items-center gap-1.5"><IconPlus size={20} /> {selectedTIS ? "Modifier le Protocole" : "Saisir un Protocole"}</h3>
              
              <form onSubmit={handleSaveTIS} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type de protocole *</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input type="radio" checked={typeTIS === 'INDUCTION'} onChange={() => setTypeTIS('INDUCTION')} /> Traitement d'induction
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input type="radio" checked={typeTIS === 'ENTRETIEN'} onChange={() => setTypeTIS('ENTRETIEN')} /> Traitement d'Entretien
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Dénomination Commune Internationale (DCI) *</label>
                  <input type="text" value={dciTIS} onChange={(e) => setDciTIS(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs bg-white" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Durée du traitement *</label>
                  <input type="text" value={durerTraitementTIS} onChange={(e) => setDurerTraitementTIS(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs bg-white" placeholder="" />
                </div>

                {typeTIS === 'INDUCTION' ? (
                  <div className="space-y-2 border-t pt-4 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Molécules d'Induction utilisées</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={grafalonTISI} onChange={(e) => setGrafalonTISI(e.target.checked)} /> Grafalon</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={atgTISI} onChange={(e) => setAtgTISI(e.target.checked)} /> ATG</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={tymoglobulineTISI} onChange={(e) => setTymoglobulineTISI(e.target.checked)} /> Thymoglobuline</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={simulectTISI} onChange={(e) => setSimulectTISI(e.target.checked)} /> Simulect</label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 border-t pt-4 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Molécules d'Entretien utilisées</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={mmfTISE} onChange={(e) => setMmfTISE(e.target.checked)} /> MMF</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={azathioprineTISE} onChange={(e) => setAzathioprineTISE(e.target.checked)} /> Azathioprine</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={cyclusporineTISE} onChange={(e) => setCyclusporineTISE(e.target.checked)} /> Ciclosporine</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={tacrolimusTISE} onChange={(e) => setTacrolimusTISE(e.target.checked)} /> Tacrolimus</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={prednisoleTISE} onChange={(e) => setPrednisoleTISE(e.target.checked)} /> Prednisole</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={prednisoluneTISE} onChange={(e) => setPrednisoluneTISE(e.target.checked)} /> Prednisolone</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"><input type="checkbox" checked={sirolimus} onChange={(e) => setSirolimus(e.target.checked)} /> Sirolimus</label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedTIS && (
                    <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                      Annuler
                    </button>
                  )}
                  <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                    {selectedTIS ? "Sauvegarder" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grille de droite */}
          <div className={`${!isReadOnly ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            
            {/* A. Grille des protocoles de fond */}
            <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconHeartbeat size={22} className="text-[#2B5296]" />
                  Dossier Clinique d'Immuno-suppression actifs
                </h3>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par DCI..." 
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
              ) : filteredLocalTreatments && filteredLocalTreatments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLocalTreatments.map((t) => {
                    const isInduction = t.typeTIS === 'INDUCTION';
                    return (
                      <div 
                        key={t.identifiantTIS} 
                        onClick={() => setSelectedTreatmentId(t.identifiantTIS!)}
                        className={`border p-5 rounded-2xl cursor-pointer transition-all ${
                          selectedTreatmentId === t.identifiantTIS 
                            ? 'border-[#2B5296] bg-blue-50/30 ring-1 ring-[#2B5296]/20' 
                            : 'border-slate-100 bg-[#F8FAFC]/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase">
                            {t.typeTIS}
                          </span>
                          <span className="text-[10px] text-[#6588BB] font-mono">ID : #{t.identifiantTIS}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mt-2">{t.dciTIS}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Durée : {t.durerTraitementTIS}</p>

                        <div className="mt-4 pt-3 border-t text-[11px] font-bold text-[#6588BB] space-y-1">
                          {isInduction ? (
                            <p>Molécules : {[t.grafalonTISI && 'Grafalon', t.atgTISI && 'ATG', t.tymoglobulineTISI && 'Thymoglobuline', t.simulectTISI && 'Simulect'].filter(Boolean).join(', ') || 'Aucune'}</p>
                          ) : (
                            <p>Molécules : {[t.mmfTISE && 'MMF', t.azathioprineTISE && 'Azathioprine', t.cyclusporineTISE && 'Ciclosporine', t.tacrolimusTISE && 'Tacrolimus', t.prednisoleTISE && 'Prednisole', t.prednisoluneTISE && 'Prednisolone', t.sirolimus && 'Sirolimus'].filter(Boolean).join(', ') || 'Aucune'}</p>
                          )}
                        </div>

                        {!isReadOnly && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setSelectedTIS(t)} className="p-1.5 bg-white text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border border-slate-100 cursor-pointer"><IconEdit size={14} /></button>
                            {canDelete && <button onClick={() => triggerDelete(t.identifiantTIS!, 'TIS')} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer"><IconTrash size={14} /></button>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">Aucun traitement de fond enregistré pour ce patient.</div>
              )}
            </div>

            {/* B. SOUS-MODULES (Prescriptions & Dosages Sanguins) */}
            {selectedTreatmentId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-5 duration-300">
                
                {/* 1. SUIVI DES PRESCRIPTIONS ET PHARMACOVIGILANCE */}
                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-[#2B5296] flex items-center gap-1.5 border-b pb-3"><IconPill size={18} /> Ordonnances & Prescriptions</h4>
                  
                  {isSuivi && (
                    <form onSubmit={handleAddPrescription} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          onChange={(e) => setSelectedMedId(e.target.value ? Number(e.target.value) : null)} 
                          value={selectedMedId || ""}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] bg-white outline-none"
                        >
                          <option value="">Sélectionner Molécule...</option>
                          {listMeds?.map(m => (
                            <option key={m.identifiantMed} value={m.identifiantMed}>
                              {m.nomMed || m.nomCommercialMed || `Molécule #${m.identifiantMed}`} 
                              {m.typeMed ? ` (${m.typeMed})` : ''}
                            </option>
                          ))}
                        </select>
                        <input type="date" value={datePremierePrise} onChange={(e) => setDatePremierePrise(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] bg-white outline-none" />
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={dosageMed} onChange={(e) => setDosageMed(e.target.value)} required className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-[11px] bg-white outline-none" placeholder="Dosage (ex: 2mg/jour)" />
                        <button type="submit" className="bg-[#2B5296] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer">Prescrire</button>
                      </div>
                    </form>
                  )}

                  <div className="border border-slate-50 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F8FAFC]">
                        <tr>
                          <th className="px-3 py-2 font-bold text-slate-500">Molécule prescrite</th>
                          <th className="px-3 py-2 font-bold text-slate-500">Dosage & Suivi</th>
                          <th className="px-3 py-2 font-bold text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {prescriptions && prescriptions.length > 0 ? (
                          prescriptions.map((p) => {
                            const aDesEffets = effetsSecondaires?.filter(es => es.prescriptionId === p.identifiantPrescription);

                            return (
                              <tr key={p.identifiantPrescription} className="hover:bg-slate-50/50">
                                <td className="px-3 py-3">
                                  <span className="font-bold text-[#2B5296] text-xs">{p.medicamentNomCommercial}</span>
                                  <p className="text-[9px] text-[#6588BB] mt-0.5">{p.medicamentType}</p>
                                  
                                  {/* Affichage des effets secondaires */}
                                  {aDesEffets && aDesEffets.map(es => (
                                    <div key={es.identifiantEFS} className="mt-1.5 p-2 bg-red-50/50 border border-red-100/50 rounded-lg text-[9px] text-red-700 font-semibold leading-relaxed">
                                      ⚠️ <strong>Complication :</strong> {es.libelleEFS} <br/>
                                      <em>Rec: {es.recommendationEFS}</em>
                                    </div>
                                  ))}
                                </td>
                                
                                <td className="px-3 py-3 font-semibold text-slate-600">
                                  {p.dosageMed} 
                                  <p className="text-[9px] text-slate-400 mt-0.5 font-sans">Prescrit le : {p.datePremierePrise}</p>
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    {(isSuivi || isImmuno) && (
                                      <button 
                                        onClick={() => triggerAddEffetSecondaire(p)}
                                        title="Signaler une complication"
                                        className="p-1 hover:bg-orange-50 text-orange-500 rounded border-none cursor-pointer focus:outline-none"
                                      >
                                        <IconAlertCircle size={14} />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button 
                                        onClick={() => triggerDelete(p.identifiantPrescription!, 'PRESCRIPTION')} 
                                        title="Supprimer"
                                        className="p-1 hover:bg-red-50 text-red-500 rounded border-none cursor-pointer focus:outline-none"
                                      >
                                        <IconTrash size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={3} className="p-4 text-center text-slate-400">Aucune prescription liée.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. SUIVI DES DOSAGES RÉSIDUELS (DOSAGES SANGUINS) */}
                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-[#2B5296] flex items-center gap-1.5 border-b pb-3"><IconFlask size={18} /> Dosages Sanguins</h4>
                  
                  {/* METTRE UN MESSAGE DU REGISTRE DE SUIVI SI BESOIN */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <IconActivity className="text-[#6588BB] mb-2 animate-bounce" size={24} />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Le suivi et l'importation de masse des dosages sanguins résiduels (Tacrolimus, Ciclosporine) s'effectuent directement via le **Bilan Biochimique Sanguin** du dossier patient.</p>
                  </div>
                </div>

              </div>
            )}

            {isReadOnly && (
              <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
                * Mode consultation : Vous disposez d'un accès en lecture seule sur cette fiche d'historique de transplantations.
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- MODAL UNIQUE D'IMPORTATION CLINIQUE (GLOBAL OU PERSONNEL) --- */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-[#2B5296]">
                {importMode === 'global' ? "Importation de Cohorte d'Immuno-suppression (CSV)" : `Importer le dossier de ${selectedPatient?.prenomP}`}
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

      {/* --- FENÊTRE DE SAISIE MODALE DE COMPLICATION (Effet Secondaire) --- */}
      {effetModalOpen && targetPrescription && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 max-w-md w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#2B5296] flex items-center gap-1.5 border-b pb-3">
              <IconAlertCircle size={20} className="text-[#2B5296]" />
              Signaler une complication / effet secondaire
            </h3>
            <p className="text-slate-500 font-semibold font-sans">
              Molécule concernée : <span className="text-[#2B5296] font-bold">{targetPrescription.medicamentNomCommercial}</span>
            </p>

            <form onSubmit={handleSaveEffetSecondaire} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Libellé de la complication *</label>
                <input 
                  type="text" 
                  value={inputLibelleEFS} 
                  onChange={(e) => setInputLibelleEFS(e.target.value)} 
                  required 
                  placeholder="" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white text-xs font-bold" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Description clinique</label>
                <textarea 
                  value={inputDescriptionEFS} 
                  onChange={(e) => setInputDescriptionEFS(e.target.value)} 
                  placeholder="" 
                  rows={3} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none resize-none bg-white text-xs" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Recommandation thérapeutique</label>
                <input 
                  type="text" 
                  value={inputRecommendationEFS} 
                  onChange={(e) => setInputRecommendationEFS(e.target.value)} 
                  placeholder="" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white text-xs" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setEffetModalOpen(false); setTargetPrescription(null); }} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border-none cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#2B5296] hover:bg-blue-900 text-white rounded-xl font-bold border-none cursor-pointer"
                >
                  Enregistrer le signalement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMATION SUPPRESSION --- */}
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer l'élément ?" message="Cette action effacera définitivement cette ligne du registre clinique thérapeutique du patient." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};