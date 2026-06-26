import { useState, useRef, useEffect } from 'react';
import { useFamilyHistory, useCreateFamilyHistory, useDeleteFamilyHistory, useDonorFamilyHistory } from '../features/family-history/hooks/useFamilyHistory';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { 
  IconUsersGroup, IconSearch, IconPlus, IconTrash, IconCalendar, IconBriefcase, IconHeartbeat,
  IconUserCheck, IconAlertCircle, IconEdit, IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import { familyHistoryService } from '../features/family-history/api/familyHistoryService';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

export const FamilyHistoryPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const location = useLocation();
  const isDonorMode = location.pathname.startsWith('/donors');
  const { data: donors } = useDonors(); // Récupère le registre des donneurs
  
  // Source de données unifiée
  const subjects = isDonorMode ? donors : patients;
  
  // --- ÉTATS DE SÉLECTION DU PATIENT ---
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  // Récupération des antécédents familiaux
  const { data: patientHistory, isLoading: loadingPatientHistory } = useFamilyHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorHistory, isLoading: loadingDonorHistory } = useDonorFamilyHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  // 3. Aiguillage dynamique du jeu de données et de l'état de chargement
  const familyHistory = isDonorMode ? donorHistory : patientHistory;
  const loadingHistory = isDonorMode ? loadingDonorHistory : loadingPatientHistory;


  const createMutation = useCreateFamilyHistory();
  const deleteMutation = useDeleteFamilyHistory(selectedPatientId || 0);

  // --- RECHERCHE LOCALE (Vue Personnelle) ---
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // --- ÉTATS FORMULAIRE ANTÉCÉDENT ---
  const [typeRelation, setTypeRelation] = useState('Père');
  const [dateDeNaissance, setDateDeNaissance] = useState('');
  const [profession, setProfession] = useState('');
  const [tares, setTares] = useState<string[]>([]); 
  const [consanguinite, setConsanguinite] = useState('Absente');
  const [autreTareTexte, setAutreTareTexte] = useState('');

  // --- CONFIGURATION MODALS & TOASTS ---
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [selectedAnt, setSelectedAnt] = useState<any | null>(null);

  // --- ÉTATS IMPORTATION ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  // Filtrage cohorte (Vue Globale)
  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const recherche = patientSearch.toLowerCase();
    
    return nomComplet.includes(recherche) || String(identifiant) === recherche;
  });

  // Filtrage local des antécédents (Vue Personnelle)
  const filteredAnts = familyHistory?.filter(af => {
    const relation = af.typeRelation?.toLowerCase() || '';
    const taresStr = af.tares?.toLowerCase() || '';
    const professionStr = af.profession?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();
    
    return relation.includes(query) || taresStr.includes(query) || professionStr.includes(query);
  }) || [];


  const handleTareChange = (tare: string) => {
    if (tares.includes(tare)) {
      setTares(tares.filter(t => t !== tare));
    } else {
      setTares([...tares, tare]);
    }
  };

  const resetForm = () => {
    setSelectedAnt(null);
    setAutreTareTexte('');
    setDateDeNaissance('');
    setProfession('');
    setTares([]);
    setTypeRelation('Père');
    setConsanguinite('Absente');
  };

  // --- ENREGISTREMENT SÉCURISÉ ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      const taresFormatees = tares.map(t => {
        if (t === "Autre") {
          return autreTareTexte ? `Autre : ${autreTareTexte}` : "";
        }
        return t;
      }).filter(t => t !== "").join(", ");

      const payload = {
        typeRelation,
        dateDeNaissance: dateDeNaissance || undefined,
        profession: profession || undefined,
        tares: taresFormatees || 'Aucune',
        consanguinite,
        patientId: isDonorMode ? undefined : String(selectedPatientId),
      };

      if (selectedAnt) {
        await familyHistoryService.update(selectedAnt.identifiantAF, payload);
        setToastMessage("Antécédent mis à jour !");
      } else {
        if (isDonorMode) {
          // Appel direct de l'API de création d'antécédent pour donneur
          await axios.post(`http://localhost:8081/api/antecedents-familiaux/donneur/${selectedPatientId}`, payload);
        } else {
          // Appel existant de mutation pour patient
          await createMutation.mutateAsync({
            patientId: String(selectedPatientId),
            data: payload
          });
        }
        setToastMessage("Antécédent familial enregistré !");
      }

      resetForm();
      setToastType('success');
      setToastOpen(true);
      queryClient.invalidateQueries({ queryKey: ['familyHistory', selectedPatientId] });
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (af: any) => {
    setSelectedAnt(af);
    setTypeRelation(af.typeRelation);
    setDateDeNaissance(af.dateDeNaissance || '');
    setProfession(af.profession || '');
    setConsanguinite(af.consanguinite);
    
    const listTares = af.tares.split(', ').map((t: string) => {
      if (t.startsWith('Autre :')) {
        setAutreTareTexte(t.replace('Autre : ', ''));
        return 'Autre';
      }
      return t;
    });
    setTares(listTares);
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
      setToastMessage("Antécédent supprimé.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression.");
      setToastOpen(true);
    }
  };

  // --- DOUBLE FLUX : EXPORT CSV ---
  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = familyHistory || []; 
      filename = `export_ant_familiaux_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await familyHistoryService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_ant_familiaux_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de la récupération des données.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun antécédent familial à exporter.");
      return;
    }

    const headers = ["identifiantAF", "patientId", "typeRelation", "consanguinite", "dateDeNaissance", "profession", "tares"];
    const csvRows = datasetToExport.map(af => [
      af.identifiantAF || "",
      af.patientId || af.patient?.identifiantP || "",
      `"${String(af.typeRelation || '').replace(/"/g, '""')}"`,
      `"${String(af.consanguinite || '').replace(/"/g, '""')}"`,
      af.dateDeNaissance || "",
      `"${String(af.profession || '').replace(/"/g, '""')}"`,
      `"${String(af.tares || '').replace(/"/g, '""')}"`
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

  // --- DOUBLE FLUX : IMPORT CSV ---
  const handleDownloadTemplate = (mode: 'global' | 'personal') => {
    const headers = mode === 'global' 
      ? ["patientId", "typeRelation", "consanguinite", "dateDeNaissance", "profession", "tares"]
      : ["typeRelation", "consanguinite", "dateDeNaissance", "profession", "tares"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_ant_familiaux_global.csv" : "modele_import_ant_familiaux_personnel.csv";
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
          typeRelation: row.typeRelation,
          consanguinite: row.consanguinite || 'Absente',
          dateDeNaissance: row.dateDeNaissance || undefined,
          profession: row.profession || undefined,
          tares: row.tares || 'Aucune'
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await familyHistoryService.create(targetPatientId, payload);
          successCount++;
        }
      } catch (err) {
        console.error("Erreur sur l'import de la ligne :", err);
      }
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    
    setToastMessage(`${successCount} antécédent(s) familial(aux) importé(s).`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['familyHistory', selectedPatientId] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION DU SUJET (PATIENT OU DONNEUR) AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUsersGroup size={24} />
            Antécédents Familiaux
          </h2>
          
          {/* ACTIONS GLOBALES S'AFFICHANT SUR L'ETAT A */}
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
              placeholder={isDonorMode ? "Rechercher un donneur par nom ou par ID..." : "Rechercher par nom ou par identifiant unique (ID)..."}
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
            {patientSearch && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y">
                {filteredPatients?.map(p => {
                  const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                  const prenom = isDonorMode ? p.prenomD : p.prenomP;
                  const nom = isDonorMode ? p.nomD : p.nomP;
                  const cin = isDonorMode ? p.cinD : p.numeroCin;
                  return (
                    <div 
                      key={idSujet}
                      onClick={() => {
                        setSelectedPatientId(idSujet!);
                        setPatientSearch('');
                        setLocalSearchTerm('');
                      }}
                      className="p-3 text-xs font-semibold hover:bg-blue-50 text-slate-800 cursor-pointer flex justify-between"
                    >
                      <span>{prenom} {nom}</span>
                      <span className="text-[#6588BB]">CIN : {cin || 'N/A'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#2B5296]">
                {isDonorMode ? "Donneur Actif" : "Patient Actif"} : {isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`}
              </span>
              <button onClick={() => { setSelectedPatientId(null); setLocalSearchTerm(''); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                Fermer le dossier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- ÉTAT A : VUE COHORTE (AUCUN SUJET SÉLECTIONNÉ) --- */}
      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">
              {isDonorMode ? "Votre cohorte d'enquêtes donneurs" : "Votre cohorte d'enquêtes familiales"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5">
              {isDonorMode 
                ? "Sélectionnez un donneur de votre portefeuille de recherche pour gérer son arbre génétique." 
                : "Sélectionnez un patient de votre portefeuille de recherche pour gérer son arbre génétique."}
            </p>
          </div>

          {filteredPatients && filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => {
                const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;
                const prenom = isDonorMode ? p.prenomD : p.prenomP;
                const nom = isDonorMode ? p.nomD : p.nomP;
                const cin = isDonorMode ? p.cinD : p.numeroCin;
                
                return (
                  <div 
                    key={idSujet}
                    onClick={() => { 
                      setSelectedPatientId(idSujet);
                      setLocalSearchTerm(''); 
                    }}
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
              <p className="font-semibold">
                {isDonorMode 
                  ? "Aucun dossier de donneur actif rattaché à votre profil." 
                  : "Aucun dossier de patient actif rattaché à votre profil."}
              </p>
            </div>
          )}
        </div>
      ) : (
        
        // --- ÉTAT B : VUE CLINIQUE PERSONNELLE (UN SUJET SÉLECTIONNÉ) ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          
          {/* Formulaire à gauche */}
          <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
            <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
              <IconPlus size={20} /> {selectedAnt ? "Modifier l'Antécédent" : "Saisir un Antécédent"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Membre de la famille *</label>
                <select 
                  value={typeRelation} 
                  onChange={(e) => setTypeRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Épouse/Époux">Épouse / Époux</option>
                  <option value="Frère">Frère</option>
                  <option value="Sœur">Sœur</option>
                  <option value="Descendants">Descendants</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Consanguinité *</label>
                <select 
                  value={consanguinite} 
                  onChange={(e) => setConsanguinite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="Absente">Absente</option>
                  <option value="1er degré">1er degré</option>
                  <option value="2ème degré">2ème degré</option>
                  <option value="> 2ème degré">&gt; 2ème degré</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date de Naissance</label>
                <input 
                  type="date" 
                  value={dateDeNaissance} 
                  onChange={(e) => setDateDeNaissance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Profession</label>
                <input 
                  type="text" 
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs" 
                  placeholder="Ex: Enseignant, Retraité..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-2">Tares détectées</label>
                <div className="space-y-1.5">
                    {["HTA", "Diabète sucré", "Autre"].map(tare => (
                      <label key={tare} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={tares.includes(tare)} 
                          onChange={() => handleTareChange(tare)}
                          className="rounded border-slate-200 text-[#006591] focus:ring-[#006591]"
                        />
                        <span>{tare === "Autre" ? "Autre, à préciser :" : tare}</span>
                      </label>
                    ))}

                    {tares.includes("Autre") && (
                      <input 
                        type="text"
                        className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-200 text-xs focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none transition-all bg-white font-bold"
                        placeholder="Précisez la pathologie..."
                        value={autreTareTexte}
                        onChange={(e) => setAutreTareTexte(e.target.value)}
                      />
                    )}
                </div>
              </div>

              <div className="flex gap-2">
                {selectedAnt && (
                  <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                    Annuler
                  </button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                  {selectedAnt ? "Mettre à jour" : "Enregistrer le membre"}
                </button>
              </div>
            </form>
          </div>

          {/* Arbre génétique à droite */}
          <div className="lg:col-span-2 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IconUsersGroup size={22} className="text-[#2B5296]" />
                    Arbre Génétique ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par tare (ex: HTA)..." 
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

              {loadingHistory ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredAnts && filteredAnts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAnts.map((af) => (
                    <div key={af.identifiantAF} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                            {af.typeRelation}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500">
                            Consanguinité : {af.consanguinite}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4">
                          {af.dateDeNaissance && <p className="flex items-center gap-1.5"><IconCalendar size={14} /> Né(e) le : {af.dateDeNaissance}</p>}
                          {af.profession && <p className="flex items-center gap-1.5"><IconBriefcase size={14} /> {af.profession}</p>}
                          <p className="flex items-center gap-1.5 text-red-600 font-bold"><IconHeartbeat size={14} /> Tares : {af.tares}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                        <button onClick={() => triggerEdit(af)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={14} /></button>
                        <button onClick={() => triggerDelete(af.identifiantAF!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun membre de la famille rattaché à ces tares cliniques.</p>
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
                {importMode === 'global' ? "Importation de Cohorte (CSV)" : `Importer l'arbre de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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
      <DeleteConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="Supprimer l'antécédent ?" 
        message="Cette action effacera définitivement ce membre de l'arbre génétique." 
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