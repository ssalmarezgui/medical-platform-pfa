import { useState, useRef, useEffect } from 'react';
import { useMarkerHistory, useSaveMarker, useDeleteMarker } from '../features/tumor-markers/hooks/useMarkers';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { markerService } from '../features/tumor-markers/api/markerService';
import { 
  IconShield, IconSearch, IconUserCheck, IconAlertCircle, IconPlus, IconTrash, IconEdit, IconReportMedical,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen,
  IconLock
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import axios from 'axios';

import { useDonorMarkerHistory } from '../features/tumor-markers/hooks/useMarkers';
import { useAuthStore } from '../store/useAuthStore';

export const TumorMarkersPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const { user } = useAuthStore();
  const roleU = user?.roleU;

  const estLabo = roleU === 'AGENT_LABORATOIRE';
  const estClinicien = roleU === 'MEDECIN_INVESTIGATEUR' || roleU === 'MEDECIN_SUIVI' || roleU === 'ADMIN';

  const aAccesPage = estLabo || estClinicien;
  const isReadOnly = estClinicien;

  if (!aAccesPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-red-100 rounded-[30px] shadow-sm max-w-lg mx-auto mt-12 text-xs">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <IconLock size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h3>
        <p className="text-[#6588BB] text-sm leading-relaxed mb-6">
          La saisie, le dosage et la validation des constantes de marqueurs tumoraux relèvent de la responsabilité légale exclusive du biologiste ou des agents de laboratoire.
        </p>
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
  
  const selectedPatient = subjects?.find(p => 
    isDonorMode ? p.identifiantD === selectedPatientId : p.identifiantP === selectedPatientId
  );

  const { data: patientMarkers, isLoading: loadingPatientMarkers } = useMarkerHistory(
    !isDonorMode ? (patientIdString || undefined) : undefined
  );

  const { data: donorMarkers, isLoading: loadingDonorMarkers } = useDonorMarkerHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined
  );

  const markerHistory = isDonorMode ? donorMarkers : patientMarkers;
  const isLoading = isDonorMode ? loadingDonorMarkers : loadingPatientMarkers;

  const saveMutation = useSaveMarker();
  const deleteMutation = useDeleteMarker(patientIdString);

  const [nomM, setNomM] = useState('PSA'); 
  const [resultat, setResultat] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'global' | 'personal'>('global');
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (markerHistory) {
      setNomM(markerHistory.nomM);
      setResultat(markerHistory.resultat || '');
    } else {
      resetForm();
    }
  }, [markerHistory]);

  const resetForm = () => {
    setNomM('PSA');
    setResultat('');
    setModeEdition(false);
  };

  const filteredPatients = subjects?.filter(p => {
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const identifiant = isDonorMode ? p.identifiantD : p.identifiantP;
    
    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const query = patientSearch.toLowerCase();
    
    return nomComplet.includes(query) || String(identifiant).toLowerCase().includes(query);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !resultat) return;

    const payload: any = {
      nomM,
      resultat,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (isDonorMode) {
        await axios.post(`http://localhost:8081/api/marqueurs-tumoraux/donneur/${selectedPatientId}`, payload);
      } else {
        await saveMutation.mutateAsync({ patientId: patientIdString, data: payload });
      }

      setToastType('success');
      setToastMessage("La fiche de marqueurs tumoraux a été enregistrée avec succès !");
      setToastOpen(true);
      setModeEdition(false);

      queryClient.invalidateQueries({ queryKey: ['markerHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorMarkerHistory'] });
    } catch {
      setToastType('error');
      setToastMessage("Erreur lors de l'enregistrement de la fiche.");
      setToastOpen(true);
    }
  };

  const handleDelete = async () => {
    const idFiche = markerHistory?.identifiantMT;
    if (!idFiche) return;

    try {
      if (isDonorMode) {
        await axios.delete(`http://localhost:8081/api/marqueurs-tumoraux/${idFiche}`);
      } else {
        await deleteMutation.mutateAsync(idFiche);
      }

      setConfirmOpen(false);
      resetForm();
      
      setToastType('success');
      setToastMessage("Fiche de marqueurs tumoraux supprimée !");
      setToastOpen(true);

      queryClient.removeQueries({ queryKey: ['markerHistory'] });
      queryClient.removeQueries({ queryKey: ['donorMarkerHistory'] });
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = markerHistory ? [markerHistory] : [];
      filename = `export_marqueurs_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await markerService.getAll();
        datasetToExport = globalData || [];
        filename = `export_global_marqueurs_tumoraux_cohorte_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune fiche de marqueur à exporter.");
      return;
    }

    const headers = ["identifiantMT", "patientId", "nomM", "resultat"];
    const csvRows = datasetToExport.map(mt => [
      mt.identifiantMT || "",
      mt.patientId || mt.patient?.identifiantP || "",
      `"${String(mt.nomM || '').replace(/"/g, '""')}"`,
      `"${String(mt.resultat || '').replace(/"/g, '""')}"`
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
      ? ["patientId", "nomM", "resultat"]
      : ["nomM", "resultat"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_marqueurs_global.csv" : "modele_import_marqueurs_personnel.csv";
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
      if (previewData[0]) {
        setNomM(previewData[0].nomM || 'PSA');
        setResultat(previewData[0].resultat || '');
        successCount = 1;
        setToastMessage(`Dosage importé pour l'enregistrement local.`);
      }
    } else {
      const mappedGroups: { [key: string]: any } = {};
      previewData.forEach(row => {
        const pid = row.patientId;
        if (!pid) return;
        mappedGroups[pid] = {
          nomM: row.nomM || 'PSA',
          resultat: row.resultat || ''
        };
      });

      for (const [pid, data] of Object.entries(mappedGroups)) {
        try {
          await markerService.save(pid, data);
          successCount++;
        } catch (err) {
          console.error("Erreur import global :", err);
        }
      }
      setToastMessage(`${successCount} fiches de marqueurs de cohorte synchronisée(s) !`);
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['markerHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorMarkerHistory'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconShield size={24} />
            Fiche de Suivi des Marqueurs Tumoraux
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
              <button onClick={() => { setSelectedPatientId(null); resetForm(); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
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
              {isDonorMode ? "Dossiers d'Oncologie Biologique de votre Cohorte Donneurs" : "Dossiers d'Oncologie Biologique de votre Cohorte Patients"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold">
              {isDonorMode 
                ? "Suivez et consignez le dosage des marqueurs tumoraux PSA ou autres de vos donneurs."
                : "Suivez et consignez le dosage des marqueurs tumoraux PSA ou autres de vos patients."}
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
                  onClick={() => { setSelectedPatientId(idSujet!); }}
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
            <div className="lg:col-span-1">
              {(!markerHistory || modeEdition) ? (
                <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
                  <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
                    <IconPlus size={20} /> {markerHistory ? "Modifier la Fiche" : "Saisir un Dosage"}
                  </h3>
                  
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type de Marqueur *</label>
                      <select value={nomM} onChange={(e) => setNomM(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                        <option value="PSA">PSA</option>
                        <option value="Autres marqueurs">Autres marqueurs tumoraux</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Résultat *</label>
                      <textarea 
                        value={resultat} 
                        onChange={(e) => setResultat(e.target.value)} 
                        required 
                        rows={4} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs resize-none bg-white outline-none" 
                        placeholder="Saisissez la valeur du dosage ou les observations médicales..." 
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      {modeEdition && (
                        <button type="button" onClick={() => setModeEdition(false)} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                      )}
                      <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                        {modeEdition ? "Sauvegarder" : "Enregistrer la Fiche"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8 text-center flex flex-col justify-center items-center">
                  <IconReportMedical size={32} className="text-[#6588BB] mb-2" />
                  <p className="text-xs font-bold text-slate-800">Dossier des Marqueurs Actif</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-semibold">La fiche de suivi a déjà été enregistrée pour ce dossier. Vous pouvez la consulter, l'exporter ou la modifier à droite.</p>
                </div>
              )}
            </div>
          )}

          <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[400px] flex flex-col justify-between`}>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconReportMedical size={22} className="text-[#2B5296]" />
                  Synthèse Clinique des Marqueurs Tumoraux
                </h3>

                {markerHistory && (
                  <div className="flex gap-2">
                    {!isReadOnly && (
                      <button 
                        onClick={() => { setImportMode('personal'); setIsImportOpen(true); }}
                        className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                        title="Importer le dosage"
                      >
                        <IconDatabaseImport size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleExportCSV('personal')}
                      className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                      title="Exporter cette fiche"
                    >
                      <IconFileSpreadsheet size={16} />
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : markerHistory ? (
                <div className="space-y-6">
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                    <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-2">Type de Marqueur évalué</h4>
                    <span className="inline-flex text-xs font-bold text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                      {markerHistory.nomM}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                    <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-3">Résultats & Observations du Dosage</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                      "{markerHistory.resultat}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun dosage de marqueurs tumoraux enregistré pour ce patient.</p>
                </div>
              )}
            </div>

            {markerHistory && !modeEdition && !isReadOnly && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-1.5">
                <button 
                  onClick={() => setModeEdition(true)}
                  title="Modifier"
                  className="p-2 bg-slate-50 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"
                >
                  <IconEdit size={16} />
                </button>
                <button 
                  onClick={() => setConfirmOpen(true)}
                  title="Supprimer"
                  className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            )}
            
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
                {importMode === 'global' ? "Importation Oncologique Globale (CSV)" : `Importer le dossier de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la fiche des marqueurs ?" message="Cette action effacera définitivement l'intégralité du suivi des marqueurs tumoraux du patient." />
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};