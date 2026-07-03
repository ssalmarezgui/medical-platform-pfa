import { useState, useRef, useEffect } from 'react';
import { useImmunologyHistory, useSaveImmunology, useDeleteImmunology } from '../features/immunology/hooks/useImmunology';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { immunologyService } from '../features/immunology/api/immunologyService';
import { 
  IconBiohazard, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconReportMedical, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorImmunologyHistory } from '../features/immunology/hooks/useImmunology';
import { usePermission } from '../hooks/usePermission';

export const ImmunologyPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const { hasPermission } = usePermission();
  const canAccess = hasPermission('READ_PATIENT') || hasPermission('READ_DONNEUR') || hasPermission('WRITE_LABO');
  const isReadOnly = !hasPermission('WRITE_LABO');

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter le pôle d'immunologie.
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
  
  const { data: patientImmunology, isLoading: loadingPatientImmuno } = useImmunologyHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorImmunology, isLoading: loadingDonorImmuno } = useDonorImmunologyHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const immunology = isDonorMode ? donorImmunology : patientImmunology;
  const loadingImmuno = isDonorMode ? loadingDonorImmuno : loadingPatientImmuno;

  const saveMutation = useSaveImmunology();
  const deleteMutation = useDeleteImmunology(patientIdString);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const listExamensImmunologiques = [
    "RAI",
    "Anticorps cytotoxiques",
    "Autres Anticorps, anti-MICA...",
    "CH50",
    "C3/C4",
    "Complément sérique, Autre",
    "Ac Anti-phospholipides",
    "AAN/AADNA",
    "ANCA/AGBM",
    "Autre"
  ];

  const [typageHLA, setTypageHLA] = useState('');
  const [bilanImmuno, setBilanImmuno] = useState("Bilan Immunologique Pré-greffe");
  
  const [selectedExamen, setSelectedExamen] = useState(listExamensImmunologiques[0]);
  const [dateAna, setDateAna] = useState(new Date().toISOString().split('T')[0]);
  const [valeurAna, setValeurAna] = useState('');
  
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
    if (immunology) {
      setTypageHLA(immunology.typageHLA || '');
      setBilanImmuno(immunology.bilanImmuno || "Bilan Immunologique Pré-greffe");
      setAnalysesSaisies(immunology.analyses || []);
    } else {
      setTypageHLA('');
      setBilanImmuno("Bilan Immunologique Pré-greffe");
      setAnalysesSaisies([]);
    }
  }, [immunology]);

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
      typeAnalyse: 'IMMUNOLOGIE'
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
      typageHLA,
      bilanImmuno,
      analyses: analysesSaisies,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (isDonorMode) {
        await axios.post(`http://localhost:8081/api/immunologie/donneur/${selectedPatientId}`, payload);
      } else {
        await saveMutation.mutateAsync({ patientId: patientIdString, data: payload });
      }

      setToastType('success');
      setToastMessage("La fiche d'immunologie a été enregistrée avec succès !");
      setToastOpen(true);

      queryClient.invalidateQueries({ queryKey: ['immunologyHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorImmunologyHistory'] });
    } catch {
      setToastType('error');
      setToastMessage("Erreur lors de l'enregistrement de la fiche.");
      setToastOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!immunology?.identifiantBI) return;
    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/immunologie/${immunology.identifiantBI}`);
      } else {
        await deleteMutation.mutateAsync(immunology.identifiantBI);
      }
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Fiche d'immunologie supprimée.");
      setToastOpen(true);
      
      setTypageHLA('');
      setBilanImmuno("Bilan Immunologique Pré-greffe");
      setAnalysesSaisies([]);
      setEditingAnalysisIndex(null);

      queryClient.removeQueries({ queryKey: ['immunologyHistory'] });
      queryClient.removeQueries({ queryKey: ['donorImmunologyHistory'] });
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
      filename = `export_immunologie_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await immunologyService.getAll();
        datasetToExport = globalData || [];
        filename = `export_global_immunologie_cohorte_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune donnée d'immunologie à exporter.");
      return;
    }

    let csvContent = "";
    if (mode === 'personal') {
      const headers = ["dateAna", "resultatAna", "valeurAna", "typeAnalyse"];
      const csvRows = datasetToExport.map(row => [
        row.dateAna || "",
        `"${String(row.resultatAna || '').replace(/"/g, '""')}"`,
        `"${String(row.valeurAna || '').replace(/"/g, '""')}"`,
        row.typeAnalyse || 'IMMUNOLOGIE'
      ].join(";"));
      csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    } else {
      const headers = ["patientId", "typageHLA", "bilanImmuno", "dateAna", "resultatAna", "valeurAna", "typeAnalyse"];
      const csvRows: string[] = [];
      datasetToExport.forEach(bi => {
        const patientId = bi.patientId || bi.patient?.identifiantP || "";
        const hla = bi.typageHLA || "";
        const lib = bi.bilanImmuno || "";
        
        if (bi.analyses && bi.analyses.length > 0) {
          bi.analyses.forEach((a: any) => {
            csvRows.push([
              patientId, `"${hla.replace(/"/g, '""')}"`, `"${lib.replace(/"/g, '""')}"`,
              a.dateAna || "", `"${a.resultatAna.replace(/"/g, '""')}"`, `"${a.valeurAna.replace(/"/g, '""')}"`,
              a.typeAnalyse || 'IMMUNOLOGIE'
            ].join(";"));
          });
        } else {
          csvRows.push([patientId, `"${hla.replace(/"/g, '""')}"`, `"${lib.replace(/"/g, '""')}"`, "", "", "", "IMMUNOLOGIE"].join(";"));
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
      ? ["patientId", "typageHLA", "bilanImmuno", "dateAna", "resultatAna", "valeurAna"]
      : ["dateAna", "resultatAna", "valeurAna"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_immunologie_global.csv" : "modele_import_immunologie_personnel.csv";
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
          resultatAna: row.resultatAna || listExamensImmunologiques[0],
          valeurAna: row.valeurAna || '',
          typeAnalyse: 'IMMUNOLOGIE'
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
            typageHLA: row.typageHLA || '',
            bilanImmuno: row.bilanImmuno || "Bilan Immunologique Pré-greffe",
            analyses: []
          };
        }
        if (row.dateAna && row.valeurAna) {
          mappedGroups[pid].analyses.push({
            dateAna: row.dateAna,
            resultatAna: row.resultatAna || listExamensImmunologiques[0],
            valeurAna: row.valeurAna,
            typeAnalyse: 'IMMUNOLOGIE'
          });
        }
      });

      for (const [pid, data] of Object.entries(mappedGroups)) {
        try {
          await immunologyService.save(pid, data);
          successCount++;
        } catch (err) {
          console.error("Erreur import global :", err);
        }
      }
      setToastMessage(`${successCount} fiche(s) d'immunologie synchronisée(s) !`);
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['immunologyHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorImmunologyHistory'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconBiohazard size={24} />
            Fiche d'Immunologie & Compatibilité
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
                {isDonorMode ? 'Donneur Actif' : 'Patient Actif'} : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`}
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
              {isDonorMode ? "Registre Immunologique de votre Cohorte Donneurs" : "Registre Immunologique de votre Cohorte Patients"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold">
              {isDonorMode ? "Consultez et complétez les données de compatibilité de vos donneurs." : "Consultez et complétez les données de compatibilité de vos patients."}
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
          
          {!isReadOnly && (
            <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit space-y-6">
              <h3 className="text-base font-bold text-[#2B5296]">Saisie du Bilan</h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Typage HLA *</label>
                  <input type="text" value={typageHLA} onChange={(e) => setTypageHLA(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none" placeholder="" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Libellé du Bilan *</label>
                  <input type="text" value={bilanImmuno} onChange={(e) => setBilanImmuno(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold bg-white outline-none" />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-[10px] font-black text-[#2B5296] uppercase mb-2">
                    {editingAnalysisIndex !== null ? "Modification de la Ligne" : "Saisie des Résultats"}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Examen *</label>
                      <select value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white font-bold text-[#2B5296]">
                        {listExamensImmunologiques.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Date *</label>
                      <input type="date" value={dateAna} onChange={(e) => setDateAna(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Résultat *</label>
                    <div className="flex gap-2">
                      <input type="text" value={valeurAna} onChange={(e) => setValeurAna(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-[10px] bg-white outline-none" placeholder="" />
                      <button type="button" onClick={handleAddAnalysisRow} className="bg-[#2B5296] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-blue-900 flex items-center justify-center shrink-0">
                        {editingAnalysisIndex !== null ? "Modifier" : "Ajouter"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {immunology && (
                    <button type="button" onClick={() => setConfirmOpen(true)} className="w-1/3 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-red-100 flex items-center justify-center gap-1"><IconTrash size={14} /> Supprimer</button>
                  )}
                  <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                    Sauvegarder la Fiche
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
                    <IconBiohazard size={22} className="text-[#2B5296]" />
                    Registre d'Immunologie ({isDonorMode ? `${selectedPatient?.prenomD} ${selectedPatient?.nomD}` : `${selectedPatient?.prenomP} ${selectedPatient?.nomP}`})
                  </h3>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par examen..." 
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

              <div className="grid grid-cols-2 gap-4 mb-6 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100/50">
                <div className="text-xs text-slate-600 col-span-2">
                  <p>Typage HLA : <strong className="text-slate-800 font-bold">{typageHLA || 'Non évalué.'}</strong></p>
                </div>
              </div>

              {loadingImmuno ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : (
                <div className="border border-slate-100 rounded-[20px] overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b">
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Examen (Analyse)</th>
                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Résultat (Valeur)</th>
                        {!isReadOnly && <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLocalAnalyses.length > 0 ? (
                        filteredLocalAnalyses.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-600">{row.dateAna}</td>
                            <td className="px-4 py-3 font-bold text-[#2B5296]">{row.resultatAna}</td>
                            <td className="px-4 py-3 font-extrabold text-slate-800">{row.valeurAna}</td>
                            {!isReadOnly && (
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => triggerEditRow(idx)}
                                    type="button" 
                                    className="p-1 hover:bg-[#DCE6F5]/50 text-[#006591] rounded-lg border-none cursor-pointer transition-colors"
                                  >
                                    <IconEdit size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveAnalysisRow(idx)} 
                                    type="button" 
                                    className="p-1 hover:bg-red-50 text-red-500 rounded-lg border-none cursor-pointer transition-colors"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isReadOnly ? 3 : 4} className="px-4 py-8 text-center text-slate-400 font-semibold">Aucun résultat d'analyse d'immunologie saisi ne correspond à vos critères.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {isReadOnly ? (
              <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
                * Consultation : Vous disposez d'un accès en lecture seule sur cette fiche.
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
                * Une fois les lignes ajoutées au tableau local, n'oubliez pas de cliquer sur "Sauvegarder la Fiche" en bas à gauche pour enregistrer définitivement le bilan d'immunologie complet de la patiente.
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
                {importMode === 'global' ? "Importation de Cohorte Immunologique (CSV)" : `Importer les analyses de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la fiche ?" message="Cette action effacera définitivement l'intégralité du bilan d'immunologie ainsi que toutes les lignes de résultats associées." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};