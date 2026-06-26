import { useState, useRef, useEffect } from 'react';
import { useHabits, useDeleteHabit, useCreateHabit } from '../features/habits/hooks/useHabits';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { habitService } from '../features/habits/api/habitService';
import { 
  IconActivity, IconSearch, IconTrash, IconUserCheck, IconAlertCircle, IconFlame, IconPill, IconClock, IconEdit,
  IconNotes, IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import { useDonorHabits } from '../features/habits/hooks/useHabits';
import axios from 'axios';

export const HabitsPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const location = useLocation();
  const isDonorMode = location.pathname.startsWith('/donors');
  const { data: donors } = useDonors();

  const subjects = isDonorMode ? donors : patients;
  
  // --- ÉTATS DE SÉLECTION DU PATIENT ---
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  // Récupération des habitudes (si patientId est vide, le backend retourne toutes les habitudes de la cohorte)
  const { data: patientHabits, isLoading: loadingPatientHabits } = useHabits(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorHabits, isLoading: loadingDonorHabits } = useDonorHabits(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const habits = isDonorMode ? donorHabits : patientHabits;
  const loadingHabits = isDonorMode ? loadingDonorHabits : loadingPatientHabits;

  const createMutation = useCreateHabit();
  const deleteMutation = useDeleteHabit(selectedPatientId || 0);

  // --- RECHERCHE LOCALE (Vue Personnelle) & RECHERCHE COHORTE (Vue Globale) ---
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // --- ÉTATS FORMULAIRE HABITUDE ---
  const [libelleHA, setLibelleHA] = useState('Tabagisme');
  const [tabacType, setTabacType] = useState('Actif');
  const [tabacSubstance, setTabacSubstance] = useState('Fumeur cigarettes');
  const [tabacConsom, setTabacConsom] = useState('');
  const [tabacExpo, setTabacExpo] = useState('');
  const [tabacSevrage, setTabacSevrage] = useState('Non');
  const [tabacSevrageDuree, setTabacSevrageDuree] = useState('');
  const [alcoolType, setAlcoolType] = useState('Jamais');
  const [alcoolRythme, setAlcoolRythme] = useState('');
  const [autreSubstance, setAutreSubstance] = useState('');
  const [autreExpo, setAutreExpo] = useState('');
  const [autreSevrage, setAutreSevrage] = useState('');

  // --- CONFIGURATION MODALS & TOASTS ---
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<any | null>(null);

  // --- ÉTATS DE L'IMPORTATION DE FICHIER ---
  const [importOpen, setImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewData] = useState<any[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  // --- FILTRES DE RECHERCHE ---
  // 1. Filtrer les patients sur la vue globale (Cohorte)
  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const query = patientSearch.toLowerCase();
    
    return nomComplet.includes(query) || String(identifiant).toLowerCase().includes(query);
  });

  // 2. Filtrer les habitudes d'un patient ouvert (Vue locale)
  const filteredLocalHabits = habits?.filter(h => {
    const substance = h.typeSubstance?.toLowerCase() || '';
    const details = h.details?.toLowerCase() || '';
    const categorie = h.libelleHA?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();
    return substance.includes(query) || details.includes(query) || categorie.includes(query);
  });

  // --- LOGIQUE EXPORT CLINIQUE (DOUBLES FLUX) ---
  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = habits || [];
      filename = `export_habitudes_patient_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await habitService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_habitudes_cohorte_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de la récupération des données de cohorte.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune donnée d'addiction à exporter.");
      return;
    }

    const headers = ["identifiantHA", "patientId", "libelleHA", "typeSubstance", "quantiteConsomme", "periodeExposition", "sevrage", "details"];
    const csvRows = datasetToExport.map(h => [
      h.identifiantHA || "",
      h.patientId || h.patient?.identifiantP || "",
      `"${String(h.libelleHA || '').replace(/"/g, '""')}"`,
      `"${String(h.typeSubstance || '').replace(/"/g, '""')}"`,
      `"${String(h.quantiteConsomme || '').replace(/"/g, '""')}"`,
      `"${String(h.periodeExposition || '').replace(/"/g, '""')}"`,
      `"${String(h.sevrage || '').replace(/"/g, '""')}"`,
      `"${String(h.details || '').replace(/"/g, '""')}"`
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

  // --- LOGIQUE IMPORT CLINIQUE (DOUBLES FLUX) ---
  const handleDownloadTemplate = (mode: 'global' | 'personal') => {
    const headers = mode === 'global' 
      ? ["patientId", "libelleHA", "typeSubstance", "quantiteConsomme", "periodeExposition", "sevrage", "details"]
      : ["libelleHA", "typeSubstance", "quantiteConsomme", "periodeExposition", "sevrage", "details"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_habitudes_global.csv" : "modele_import_habitudes_personnel.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

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
    if (previewRows.length === 0) return;
    setIsProcessingImport(true);
    let successCount = 0;

    for (const row of previewRows) {
      try {
        const payload = {
          libelleHA: row.libelleHA,
          typeSubstance: row.typeSubstance,
          quantiteConsomme: row.quantiteConsomme || 'Non précisé',
          periodeExposition: row.periodeExposition || 'Non précisé',
          sevrage: row.sevrage || 'Non',
          details: row.details || ''
        };

        const targetId = importMode === 'global' ? (row.patientId || row.donorId) : patientIdString;
        
        if (targetId) {
          if (isDonorMode) {
            await axios.post(`http://localhost:8081/api/habitudes/donneur/${targetId}`, payload);
          } else {
            await habitService.create(targetId, payload);
          }
          successCount++;
        }
      } catch (err) {
        console.error("Erreur sur l'import de la ligne :", err);
      }
    }

    setIsProcessingImport(false);
    setImportOpen(false);
    setSelectedFile(null);
    setPreviewData([]);
    
    setToastMessage(`${successCount} habitude(s) enregistrée(s) avec succès !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: isDonorMode ? ['donorHabits', selectedPatientId] : ['habits', patientIdString] });
  };

  // --- ENREGISTREMENT SÉCURISÉ ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    let payload: any = {
      libelleHA,
      patientId: isDonorMode ? undefined : patientIdString,
    };

    if (libelleHA === 'Tabagisme') {
      payload.typeSubstance = tabacSubstance;
      payload.details = `Type: ${tabacType}`;
      payload.quantiteConsomme = tabacConsom || 'Non précisé';
      payload.periodeExposition = tabacExpo || 'Non précisé';
      payload.sevrage = tabacSevrage === 'Oui' ? `Oui, durée: ${tabacSevrageDuree}` : 'Non';
    } else if (libelleHA === 'Éthylisme') {
      payload.typeSubstance = alcoolType;
      payload.details = alcoolType.includes('rythme') ? `Rythme: ${alcoolRythme}` : '';
      payload.quantiteConsomme = '';
      payload.periodeExposition = '';
      payload.sevrage = '';
    } else {
      payload.typeSubstance = autreSubstance || 'Non précisée';
      payload.periodeExposition = autreExpo || 'Non précisée';
      payload.sevrage = autreSevrage || 'Non prése';
      payload.details = '';
      payload.quantiteConsomme = '';
    }

    try {
      if (selectedHabit) {
        await habitService.update(selectedHabit.identifiantHA, payload);
        setToastMessage("Habitude de vie mise à jour !");
      } else {
        if (isDonorMode) {
          await axios.post(`http://localhost:8081/api/habitudes/donneur/${selectedPatientId}`, payload);
        } else {
          await createMutation.mutateAsync({ patientId: patientIdString, data: payload });
        }
        setToastMessage("Habitude enregistrée avec succès !");
      }

      setToastType('success');
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: isDonorMode ? ['donorHabits', selectedPatientId] : ['habits', patientIdString] });
      
      setSelectedHabit(null);
      setTabacConsom(''); setTabacExpo(''); setTabacSevrageDuree('');
      setAlcoolRythme(''); setAutreSubstance(''); setAutreExpo(''); setAutreSevrage('');
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (habit: any) => {
    setSelectedHabit(habit);
    setLibelleHA(habit.libelleHA);

    if (habit.libelleHA === 'Tabagisme') {
      setTabacSubstance(habit.typeSubstance);
      setTabacConsom(habit.quantiteConsomme || '');
      setTabacExpo(habit.periodeExposition || '');
      const typeExtrait = habit.details?.replace('Type: ', '') || 'Actif';
      setTabacType(typeExtrait);

      if (habit.sevrage?.startsWith('Oui')) {
        setTabacSevrage('Oui');
        setTabacSevrageDuree(habit.sevrage.replace('Oui, durée: ', ''));
      } else {
        setTabacSevrage('Non');
        setTabacSevrageDuree('');
      }
    } else if (habit.libelleHA === 'Éthylisme') {
      setAlcoolType(habit.typeSubstance);
      const rythmeExtrait = habit.details?.replace('Rythme: ', '') || '';
      setAlcoolRythme(rythmeExtrait);
    } else {
      setAutreSubstance(habit.typeSubstance);
      setAutreExpo(habit.periodeExposition || '');
      setAutreSevrage(habit.sevrage || '');
    }
  };

  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/habitudes/${idToDelete}`);
      } else {
        await deleteMutation.mutateAsync(idToDelete);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Habitude de vie supprimée.");
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: isDonorMode ? ['donorHabits', selectedPatientId] : ['habits', patientIdString] });
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur de suppression.");
      setToastOpen(true);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION PATIENT AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Saisie des Habitudes Cliniques
          </h2>
          
          {/* ACTIONS GLOBALES S'AFFICHANT SUR L'ETAT A (AUCUN PATIENT SELECTIONNE) */}
          {!selectedPatientId && (
            <div className="flex gap-2">
              <button 
                onClick={() => { setImportMode('global'); setImportOpen(true); }}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
                title={isDonorMode ? "Importer des habitudes pour plusieurs donneurs" : "Importer des habitudes pour plusieurs patients"}
              >
                <IconDatabaseImport size={16} /> Import de Cohorte
              </button>
              <button 
                onClick={() => handleExportCSV('global')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
                title="Exporter toutes les habitudes cliniques"
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
              placeholder={isDonorMode ? "Rechercher ou sélectionner un donneur pour ouvrir son dossier..." : "Rechercher ou sélectionner un patient pour ouvrir son dossier clinique..."}
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
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y divide-slate-50">
                {filteredPatients.map(p => {
                  const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                  return (
                    <div 
                      key={idSujet} 
                      onClick={() => { setSelectedPatientId(idSujet); setPatientSearch(''); setLocalSearchTerm(''); }} 
                      className="p-3 text-xs font-semibold hover:bg-blue-50 text-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <span className="font-bold">{isDonorMode ? `${p.prenomD} ${p.nomD}` : `${p.prenomP} ${p.nomP}`}</span>
                      <span className="text-[10px] font-bold bg-blue-50 text-[#2B5296] px-2 py-0.5 rounded-md">ID : {idSujet}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#2B5296]">
                Dossier : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`}
              </span>
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">Fermer le dossier</button>
            </div>
          )}
        </div>
      </div>

      {/* --- ÉTAT A : VUE COHORTE (AUCUN PATIENT SÉLECTIONNÉ) --- */}
      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isDonorMode ? "Votre cohorte de donneurs suivis" : "Votre cohorte de patients suivis"}
              </h3>
              <p className="text-[#6588BB] text-xs mt-0.5">
                {isDonorMode 
                  ? "Cliquez sur un donneur pour accéder à sa saisie clinique personnalisée." 
                  : "Cliquez sur un patient pour accéder à sa saisie clinique personnalisée."}
              </p>
            </div>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((p) => {
                const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                return (
                  <div 
                    key={idSujet}
                    onClick={() => { setSelectedPatientId(idSujet); setLocalSearchTerm(''); }}
                    className="border border-slate-100 hover:border-[#2B5296]/50 bg-[#F8FAFC]/50 hover:bg-blue-50/10 p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {isDonorMode ? `${p.prenomD} ${p.nomD}` : `${p.prenomP} ${p.nomP}`}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">ID : {idSujet}</p>
                      <p className="text-[10px] text-[#6588BB] font-semibold mt-1">
                        {isDonorMode ? `CIN : ${p.cinD || 'N/A'}` : `CIN : ${p.numeroCin || 'N/A'}`}
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
              <p className="font-semibold">
                {isDonorMode 
                  ? "Aucun donneur affecté à votre dossier investigateur pour le moment." 
                  : "Aucun patient affecté à votre dossier investigateur pour le moment."}
              </p>
            </div>
          )}
        </div>
      ) : (

        // --- ÉTAT B : VUE CLINIQUE PERSONNELLE (UN PATIENT SÉLECTIONNÉ) ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {/* Formulaire de saisie à gauche */}
          <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
            <h3 className="text-base font-bold text-[#2B5296] mb-6">
              {selectedHabit ? "Modifier l'Habitude" : "Saisir une Habitude"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Catégorie d'addiction</label>
                <select value={libelleHA} onChange={(e) => setLibelleHA(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                  <option value="Tabagisme">Tabagisme</option>
                  <option value="Éthylisme">Éthylisme</option>
                  <option value="Autres addictions">Autres addictions</option>
                </select>
              </div>

              {/* TABAGISME */}
              {libelleHA === 'Tabagisme' && (
                <div className="space-y-4 border-t border-slate-50 pt-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type *</label>
                    <select value={tabacType} onChange={(e) => setTabacType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                      <option value="Actif">Actif</option>
                      <option value="Passif">Passif</option>
                      <option value="Non exposé">Non exposé</option>
                      <option value="Non précisé">Non précisé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Substance *</label>
                    <select value={tabacSubstance} onChange={(e) => setTabacSubstance(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                      <option value="Fumeur cigarettes">Fumeur cigarettes</option>
                      <option value="Chicha">Chicha</option>
                      <option value="Vape / Cigarette électronique">Vape / Cigarette électronique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Quantité Journalière</label>
                    <input type="text" value={tabacConsom} onChange={(e) => setTabacConsom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: 10 cigarettes" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Durée d'exposition</label>
                    <input type="text" value={tabacExpo} onChange={(e) => setTabacExpo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: 5 ans" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Sevrage clinique *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <input type="radio" checked={tabacSevrage === 'Non'} onChange={() => setTabacSevrage('Non')} /> Non
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <input type="radio" checked={tabacSevrage === 'Oui'} onChange={() => setTabacSevrage('Oui')} /> Oui
                      </label>
                    </div>
                  </div>
                  {tabacSevrage === 'Oui' && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Durée du sevrage</label>
                      <input type="text" value={tabacSevrageDuree} onChange={(e) => setTabacSevrageDuree(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: 6 mois" />
                    </div>
                  )}
                </div>
              )}

              {/* ETHYLISME */}
              {libelleHA === 'Éthylisme' && (
                <div className="space-y-4 border-t border-slate-50 pt-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type *</label>
                    <select value={alcoolType} onChange={(e) => setAlcoolType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                      <option value="Jamais">Jamais</option>
                      <option value="Oui, régulière">Oui, régulière</option>
                      <option value="Oui, occasionnelle">Oui, occasionnelle</option>
                      <option value="Non précisé">Non précisé</option>
                    </select>
                  </div>
                  {alcoolType.includes('Oui') && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Rythme de consommation</label>
                      <input type="text" value={alcoolRythme} onChange={(e) => setAlcoolRythme(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: 2 verres par semaine" />
                    </div>
                  )}
                </div>
              )}

              {/* AUTRES ADDICTIONS */}
              {libelleHA === 'Autres addictions' && (
                <div className="space-y-4 border-t border-slate-50 pt-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Substance *</label>
                    <input type="text" value={autreSubstance} onChange={(e) => setAutreSubstance(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: Caféine intensive, somnifères" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Période d'exposition</label>
                    <input type="text" value={autreExpo} onChange={(e) => setAutreExpo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: 2 ans" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Sevrage</label>
                    <input type="text" value={autreSevrage} onChange={(e) => setAutreSevrage(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Ex: Oui, depuis 3 mois" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {selectedHabit && (
                  <button type="button" onClick={() => { setSelectedHabit(null); }} className="w-1/3 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                    Annuler
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                  {selectedHabit ? "Mettre à jour" : "Enregistrer l'Habitude"}
                </button>
              </div>
            </form>
          </div>

          {/* Tableau de l'historique personnel à droite */}
          <div className="lg:col-span-2 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconActivity size={22} className="text-[#2B5296]" />
                    Registre des Addictions ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer les addictions..." 
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => { setImportMode('personal'); setImportOpen(true); }}
                    className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Importer des habitudes pour ce patient"
                  >
                    <IconDatabaseImport size={16} />
                  </button>
                  <button 
                    onClick={() => handleExportCSV('personal')}
                    className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Exporter l'historique du patient"
                  >
                    <IconFileSpreadsheet size={16} />
                  </button>
                </div>
              </div>

              {loadingHabits ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredLocalHabits && filteredLocalHabits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLocalHabits.map((h) => (
                    <div key={h.identifiantHA} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                            {h.libelleHA}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            h.sevrage.startsWith('Oui') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            Sevrage : {h.sevrage}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                          <IconFlame size={16} className="text-[#6588BB]" />
                          {h.typeSubstance}
                        </h4>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                          {h.quantiteConsomme && <p className="flex items-center gap-1.5"><IconPill size={14} /> Consom. Quotidienne : <strong>{h.quantiteConsomme}</strong></p>}
                          {h.periodeExposition && <p className="flex items-center gap-1.5"><IconClock size={14} /> Exposition : <strong>{h.periodeExposition}</strong></p>}
                          {h.details && <p className="flex items-start gap-1.5 italic text-slate-500 mt-1"><IconNotes size={14} className="shrink-0 mt-0.5" /> "{h.details}"</p>}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50/50 flex justify-end gap-1.5">
                        <button onClick={() => triggerEdit(h)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={14} /></button>
                        <button onClick={() => triggerDelete(h.identifiantHA!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun registre ne correspond à vos filtres d'addiction.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- MODAL UNIQUE D'IMPORTATION CLINIQUE (GLOBAL OU PERSONNEL) --- */}
      {importOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-[#2B5296]">
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer les habitudes de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
              </h2>
              <button onClick={() => { setImportOpen(false); setSelectedFile(null); setPreviewData([]); }} className="border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-slate-100 text-slate-400"><IconX size={20} /></button>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[20px] p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
              <IconFileSpreadsheet className="mx-auto text-[#006591] mb-4" size={32} />
              <p className="font-bold text-slate-500 uppercase">Sélectionner fichier .CSV</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            </div>

            {selectedFile && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#2B5296] truncate max-w-[250px]">{selectedFile.name}</span>
                  <span className="text-[10px] font-bold bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full border">
                    {previewRows.length} lignes à importer
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => handleDownloadTemplate(importMode)} 
                className="flex-1 bg-white border border-[#2B5296] text-[#2B5296] py-3 rounded-xl font-bold hover:bg-[#2B5296]/5 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <IconDownload size={16} /> Modèle de saisie
              </button>

              <button 
                type="button" 
                onClick={handleImportSubmit} 
                disabled={isProcessingImport || !selectedFile} 
                className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-[#1a386b] cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isProcessingImport ? <IconLoader className="animate-spin" size={16} /> : "Lancer l'importation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMATION SUPPRESSION --- */}
      <DeleteConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="Supprimer l'habitude ?" 
        message="Cette action effacera définitivement ce registre d'habitude du patient." 
      />

      <Toast 
        isOpen={toastOpen} 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
      />
    </div>
  );
};