import { useState, useRef, useEffect } from 'react';
import { 
  useObgynHistory, 
  useDonorObgynHistory, 
  useCreateObgyn, 
  useCreateDonorObgyn, 
  useUpdateObgyn 
} from '../features/obgyn/hooks/useObgyn';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { obgynService } from '../features/obgyn/api/obgynService';
import { 
  IconDna, IconSearch, IconUserCheck, IconAlertTriangle, IconCalendar, IconLoader, IconReportMedical, IconEdit, IconTrash,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconDownload, IconFolderOpen, IconAlertCircle
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

import { useLocation } from 'react-router-dom';
import { useDonors } from '../features/donors/hooks/useDonors';
import { usePermission } from '../hooks/usePermission';
import { useAuthStore } from '../store/useAuthStore';

export const ObgynHistoryPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();

  const { hasPermission } = usePermission();
  const userRole = useAuthStore((state) => state.role);

  const canAccess = hasPermission('READ_PATIENT') || hasPermission('READ_DONNEUR') || hasPermission('WRITE_PATIENT') || hasPermission('WRITE_DONNEUR');
  const isReadOnly = (!hasPermission('WRITE_PATIENT') && !hasPermission('WRITE_DONNEUR')) || userRole === 'ADMIN';

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter l'historique gynéco-obstétrique.
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

  const sexe = isDonorMode ? (selectedPatient?.sexeD || selectedPatient?.sexeP) : selectedPatient?.sexeP;
  const isFemale = sexe === 'F' || sexe === 'Féminin';

  const { data: patientObgyn, isLoading: loadingPatientObgyn } = useObgynHistory(
    !isDonorMode ? patientIdString : '', 
    !isDonorMode && isFemale
  );

  const { data: donorObgyn, isLoading: loadingDonorObgyn } = useDonorObgynHistory(
    isDonorMode ? (selectedPatientId || undefined) : undefined,
    isFemale 
  );

  const obgynHistory = isDonorMode ? donorObgyn : patientObgyn;
  const isLoading = isDonorMode ? loadingDonorObgyn : loadingPatientObgyn;

  const createMutation = useCreateObgyn();
  const createDonorMutation = useCreateDonorObgyn(); 
  const updateMutation = useUpdateObgyn();

  const [datePremieresRegles, setDatePremieresRegles] = useState('');
  const [menopause, setMenopause] = useState('Non');
  const [menopauseDate, setMenopauseDate] = useState('');
  
  const [grossessesNombreTotal, setGrossessesNombreTotal] = useState(0);
  const [grossessesAvortementsProvoques, setGrossessesAvortementsProvoques] = useState(0);
  const [grossessesPreeclampsie, setGrossessesPreeclampsie] = useState(0);
  const [grossessesAccouchementsPrematures, setGrossessesAccouchementsPrematures] = useState(0);
  const [grossessesAvortementsSpontanes, setGrossessesAvortementsSpontanes] = useState(0);
  const [grossessesCesarienne, setGrossessesCesarienne] = useState(0);

  const [contraceptionMethodes, setContraceptionMethodes] = useState('');
  const [contraceptionDuree, setContraceptionDuree] = useState('');
  const [pathologieMammaireGyneco, setPathologieMammaireGyneco] = useState('');

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
    if (obgynHistory) {
      setDatePremieresRegles(obgynHistory.datePremieresRegles || '');
      if (obgynHistory.menopause && obgynHistory.menopause.startsWith('Oui')) {
        setMenopause('Oui');
        setMenopauseDate(obgynHistory.menopause.replace('Oui, date: ', ''));
      } else {
        setMenopause('Non');
        setMenopauseDate('');
      }
      setGrossessesNombreTotal(obgynHistory.grossessesNombreTotal || 0);
      setGrossessesAvortementsProvoques(obgynHistory.grossessesAvortementsProvoques || 0);
      setGrossessesPreeclampsie(obgynHistory.grossessesPreeclampsie || 0);
      setGrossessesAccouchementsPrematures(obgynHistory.grossessesAccouchementsPrematures || 0);
      setGrossessesAvortementsSpontanes(obgynHistory.grossessesAvortementsSpontanes || 0);
      setGrossessesCesarienne(obgynHistory.grossessesCesarienne || 0);
      setContraceptionMethodes(obgynHistory.contraceptionMethodes || '');
      setContraceptionDuree(obgynHistory.contraceptionDuree || '');
      setPathologieMammaireGyneco(obgynHistory.pathologieMammaireGyneco || '');
    } else {
      resetForm();
    }
  }, [obgynHistory]);

  const resetForm = () => {
    setDatePremieresRegles('');
    setMenopause('Non');
    setMenopauseDate('');
    setGrossessesNombreTotal(0);
    setGrossessesAvortementsProvoques(0);
    setGrossessesPreeclampsie(0);
    setGrossessesAccouchementsPrematures(0);
    setGrossessesAvortementsSpontanes(0);
    setGrossessesCesarienne(0);
    setContraceptionMethodes('');
    setContraceptionDuree('');
    setPathologieMammaireGyneco('');
    setModeEdition(false);
  };

  const filteredPatients = subjects?.filter(p => {
    const currentSexe = isDonorMode ? (p.sexeD || p.sexeP) : p.sexeP;
    const isFemaleSubject = currentSexe === 'F' || currentSexe === 'Féminin';
    
    const nom = isDonorMode ? p.nomD : p.nomP;
    const prenom = isDonorMode ? p.prenomD : p.prenomP;
    const idSujet = isDonorMode ? p.identifiantD : p.identifiantP;

    const nomComplet = `${prenom} ${nom}`.toLowerCase();
    const matchesQuery = nomComplet.includes(patientSearch.toLowerCase()) || String(idSujet) === patientSearch;
    return isFemaleSubject && matchesQuery;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !isFemale) return;

    const payload: any = {
      datePremieresRegles: datePremieresRegles || undefined,
      menopause: menopause === 'Oui' ? `Oui, date: ${menopauseDate}` : 'Non',
      grossessesNombreTotal: Number(grossessesNombreTotal),
      grossessesAvortementsProvoques: Number(grossessesAvortementsProvoques),
      grossessesPreeclampsie: Number(grossessesPreeclampsie),
      grossessesAccouchementsPrematures: Number(grossessesAccouchementsPrematures),
      grossessesAvortementsSpontanes: Number(grossessesAvortementsSpontanes),
      grossessesCesarienne: Number(grossessesCesarienne),
      contraceptionMethodes: contraceptionMethodes || undefined,
      contraceptionDuree: contraceptionDuree || undefined,
      pathologieMammaireGyneco: pathologieMammaireGyneco || undefined,
    };

    if (!isDonorMode) {
      payload.patientId = patientIdString;
    }

    try {
      if (obgynHistory?.identifiantAGO) {
        await updateMutation.mutateAsync({
          id: obgynHistory.identifiantAGO,
          data: payload
        });
        setToastMessage("Fiche mise à jour !");
      } else {
        if (isDonorMode) {
          await createDonorMutation.mutateAsync({
            donorId: selectedPatientId,
            data: payload
          });
        } else {
          await createMutation.mutateAsync({
            patientId: patientIdString,
            data: payload
          });
        }
        setToastMessage("AGO enregistré avec succès !");
      }

      setToastType('success');
      setToastOpen(true);
      setModeEdition(false);

      queryClient.invalidateQueries({ queryKey: ['obgynHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donorObgynHistory'] });
      queryClient.invalidateQueries({ queryKey: ['obgyn-history'] });
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!obgynHistory?.identifiantAGO) return;
    try {
      await obgynService.delete(obgynHistory.identifiantAGO);
      
      setConfirmOpen(false);
      resetForm();

      setToastType('success');
      setToastMessage("Le dossier gynécologique a été supprimé avec succès.");
      setToastOpen(true);

      queryClient.removeQueries({ queryKey: ['obgynHistory'] });
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression du dossier.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = async (mode: 'global' | 'personal') => {
    let datasetToExport: any[] = [];
    let filename = '';

    if (mode === 'personal' && selectedPatientId) {
      datasetToExport = obgynHistory ? [obgynHistory] : [];
      filename = `export_ago_${isDonorMode ? 'donneur' : 'patient'}_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await obgynService.getAll();
        datasetToExport = globalData || [];
        filename = `export_global_ago_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de la récupération des données.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucun antécédent gynéco-obstétrique à exporter.");
      return;
    }

    const headers = [
      "identifiantAGO", "patientId", "datePremieresRegles", "menopause", 
      "grossessesNombreTotal", "grossessesAvortementsProvoques", "grossessesPreeclampsie", 
      "grossessesAccouchementsPrematures", "grossessesAvortementsSpontanes", 
      "grossessesCesarienne", "contraceptionMethodes", "contraceptionDuree", "pathologieMammaireGyneco"
    ];

    const csvRows = datasetToExport.map(ago => [
      ago.identifiantAGO || "",
      ago.patientId || ago.patient?.identifiantP || "",
      ago.datePremieresRegles || "",
      `"${String(ago.menopause || '').replace(/"/g, '""')}"`,
      ago.grossessesNombreTotal || 0,
      ago.grossessesAvortementsProvoques || 0,
      ago.grossessesPreeclampsie || 0,
      ago.grossessesAccouchementsPrematures || 0,
      ago.grossessesAvortementsSpontanes || 0,
      ago.grossessesCesarienne || 0,
      `"${String(ago.contraceptionMethodes || '').replace(/"/g, '""')}"`,
      `"${String(ago.contraceptionDuree || '').replace(/"/g, '""')}"`,
      `"${String(ago.pathologieMammaireGyneco || '').replace(/"/g, '""')}"`
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
      ? ["patientId", "datePremieresRegles", "menopause", "grossessesNombreTotal", "grossessesAvortementsProvoques", "grossessesPreeclampsie", "grossessesAccouchementsPrematures", "grossessesAvortementsSpontanes", "grossessesCesarienne", "contraceptionMethodes", "contraceptionDuree", "pathologieMammaireGyneco"]
      : ["datePremieresRegles", "menopause", "grossessesNombreTotal", "grossessesAvortementsProvoques", "grossessesPreeclampsie", "grossessesAccouchementsPrematures", "grossessesAvortementsSpontanes", "grossessesCesarienne", "contraceptionMethodes", "contraceptionDuree", "pathologieMammaireGyneco"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_ago_global.csv" : "modele_import_ago_personnel.csv";
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
          datePremieresRegles: row.datePremieresRegles || undefined,
          menopause: row.menopause || 'Non',
          grossessesNombreTotal: Number(row.grossessesNombreTotal || 0),
          grossessesAvortementsProvoques: Number(row.grossessesAvortementsProvoques || 0),
          grossessesPreeclampsie: Number(row.grossessesPreeclampsie || 0),
          grossessesAccouchementsPrematures: Number(row.grossessesAccouchementsPrematures || 0),
          grossessesAvortementsSpontanes: Number(row.grossessesAvortementsSpontanes || 0),
          grossessesCesarienne: Number(row.grossessesCesarienne || 0),
          contraceptionMethodes: row.contraceptionMethodes || undefined,
          contraceptionDuree: row.contraceptionDuree || undefined,
          pathologieMammaireGyneco: row.pathologieMammaireGyneco || undefined
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        
        if (targetPatientId) {
          await obgynService.create(targetPatientId, payload);
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
    
    setToastMessage(`${successCount} dossier(s) gynécologique(s) importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['obgynHistory'] });
    queryClient.invalidateQueries({ queryKey: ['donorObgynHistory'] });
    queryClient.invalidateQueries({ queryKey: ['obgyn-history'] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Antécédents Gynéco-Obstétriques (AGO)
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
              placeholder={isDonorMode ? "Rechercher une donneuse par nom ou par ID..." : "Rechercher par nom ou par ID de patiente..."}
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
                {isDonorMode ? "Donneuse active" : "Patiente active"} : {isDonorMode ? `${selectedPatient.prenomD} ${selectedPatient.nomD}` : `${selectedPatient.prenomP} ${selectedPatient.nomP}`} ({sexe || 'F'})
              </span>
              <button onClick={() => { setSelectedPatientId(null); resetForm(); }} className="text-xs text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">Fermer le dossier</button>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">
              {isDonorMode ? "Portefeuille Gynéco-Obstétrique de la Cohorte Donneurs" : "Portefeuille Gynéco-Obstétrique de la Cohorte Patients"}
            </h3>
            <p className="text-[#6588BB] text-xs mt-0.5">
              {isDonorMode ? "Sont affichées ici uniquement les donneuses de sexe féminin." : "Sont affichées ici uniquement les patientes de sexe féminin."}
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
                    onClick={() => { setSelectedPatientId(idSujet!); }}
                    className="border border-slate-100 hover:border-[#2B5296]/50 bg-[#F8FAFC]/50 hover:bg-blue-50/10 p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{prenom} {nom}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">ID : {idSujet}</p>
                      <p className="text-[10px] text-[#6588BB] font-semibold mt-1">CIN : {cin || 'N/A'}</p>
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
                  ? "Aucune donneuse de sexe féminin enregistrée dans votre registre d'enquêtes." 
                  : "Aucune patiente de sexe féminin enregistrée dans votre registre d'enquêtes."}
              </p>
            </div>
          )}
        </div>
      ) : !isFemale ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 border border-red-200 rounded-[30px] p-8 text-center">
          <IconAlertTriangle size={48} className="text-red-500 mb-4 animate-bounce" />
          <h3 className="text-base font-bold text-red-800">AGO non applicable</h3>
          <p className="text-xs text-red-600 mt-1 max-w-sm">
            {isDonorMode 
              ? "Le dossier gynéco-obstétrique ne peut être rempli que pour les donneuses (sexe féminin)." 
              : "Le dossier gynéco-obstétrique ne peut être rempli que pour les patientes (sexe féminin)."}
          </p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {!isReadOnly && (
            <div className="lg:col-span-1">
              {(!obgynHistory || modeEdition) ? (
                <form onSubmit={handleSave} className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm space-y-4 h-fit">
                  <h3 className="text-base font-bold text-[#2B5296] mb-4">
                    {obgynHistory ? "Modifier le Dossier Gynéco" : "Saisir les Antécédents"}
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date premières règles</label>
                    <input type="date" value={datePremieresRegles} onChange={(e) => setDatePremieresRegles(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Ménopause *</label>
                    <select value={menopause} onChange={(e) => setMenopause(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                      <option value="Non">Non</option>
                      <option value="Oui">Oui</option>
                    </select>
                    {menopause === 'Oui' && (
                      <input type="date" value={menopauseDate} onChange={(e) => setMenopauseDate(e.target.value)} className="w-full px-4 py-2 mt-2 rounded-xl border border-slate-200 text-xs bg-white" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Grossesses Total</label>
                      <input type="number" min={0} value={grossessesNombreTotal} onChange={(e) => setGrossessesNombreTotal(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Avortements Provoqués</label>
                      <input type="number" min={0} value={grossessesAvortementsProvoques} onChange={(e) => setGrossessesAvortementsProvoques(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Prééclampsie</label>
                      <input type="number" min={0} value={grossessesPreeclampsie} onChange={(e) => setGrossessesPreeclampsie(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Accouch. Prématurés</label>
                      <input type="number" min={0} value={grossessesAccouchementsPrematures} onChange={(e) => setGrossessesAccouchementsPrematures(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Avortements Spontanés</label>
                      <input type="number" min={0} value={grossessesAvortementsSpontanes} onChange={(e) => setGrossessesAvortementsSpontanes(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Césariennes</label>
                      <input type="number" min={0} value={grossessesCesarienne} onChange={(e) => setGrossessesCesarienne(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Méthodes Contraception</label>
                    <input type="text" value={contraceptionMethodes} onChange={(e) => setContraceptionMethodes(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white" placeholder="" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Durée Contraception</label>
                    <input type="text" value={contraceptionDuree} onChange={(e) => setContraceptionDuree(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white" placeholder="Ex: 3 ans" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Pathologie Gynécologique</label>
                    <textarea value={pathologieMammaireGyneco} onChange={(e) => setPathologieMammaireGyneco(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs resize-none bg-white" placeholder="" />
                  </div>

                  <div className="flex gap-2 pt-4">
                    {modeEdition && (
                      <button type="button" onClick={() => setModeEdition(false)} className="w-1/3 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                    )}
                    <button type="submit" className="flex-1 bg-[#2B5296] text-white py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">
                      {modeEdition ? "Sauvegarder" : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-8 text-center flex flex-col justify-center items-center">
                  <IconReportMedical size={32} className="text-[#6588BB] mb-2" />
                  <p className="text-xs font-bold text-slate-800">Dossier Gynécologique Actif</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Les antécédents de cette patiente ont été enregistrés. Utilisez la fiche clinique à droite pour les consulter, les exporter ou les modifier.</p>
                </div>
              )}
            </div>
          )}

          <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between`}>
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconReportMedical size={22} className="text-[#2B5296]" />
                  Synthèse Clinique Gynéco-Obstétrique
                </h3>

                {obgynHistory && (
                  <div className="flex gap-2">
                    {!isReadOnly && (
                      <button 
                        onClick={() => { setImportMode('personal'); setIsImportOpen(true); }}
                        className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                        title="Importer les AGO"
                      >
                        <IconDatabaseImport size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleExportCSV('personal')}
                      className="p-2 bg-white border border-slate-200 text-[#006591] hover:bg-slate-50 rounded-xl cursor-pointer"
                      title="Exporter le dossier gynécologique"
                    >
                      <IconFileSpreadsheet size={16} />
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : obgynHistory ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                    <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-3">1. Règles & Ménopause</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                      <p>Premières règles le : <strong>{obgynHistory.datePremieresRegles || 'Non renseigné'}</strong></p>
                      <p className="font-bold text-red-600">Ménopause : {obgynHistory.menopause}</p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                    <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-3">2. Suivi Obstétrique (Grossesses)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs text-slate-600">
                      <p>Nombre total : <strong className="text-slate-900">{obgynHistory.grossessesNombreTotal}</strong></p>
                      <p>Césariennes : <strong className="text-slate-900">{obgynHistory.grossessesCesarienne}</strong></p>
                      <p>Prééclampsie : <strong className="text-red-500 font-bold">{obgynHistory.grossessesPreeclampsie}</strong></p>
                      <p>Accouch. Prématurés : <strong className="text-red-500 font-bold">{obgynHistory.grossessesAccouchementsPrematures}</strong></p>
                      <p>Avortements spontanés : <strong className="text-slate-900">{obgynHistory.grossessesAvortementsSpontanes}</strong></p>
                      <p>Avortements provoqués : <strong className="text-slate-900">{obgynHistory.grossessesAvortementsProvoques}</strong></p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                    <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-3">3. Contraception</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                      <p>Méthodes : <strong>{obgynHistory.contraceptionMethodes || 'Aucune'}</strong></p>
                      <p>Durée : <strong>{obgynHistory.contraceptionDuree || 'Aucune'}</strong></p>
                    </div>
                  </div>

                  {obgynHistory.pathologieMammaireGyneco && (
                    <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100/50">
                      <h4 className="text-xs font-black text-[#2B5296] uppercase tracking-wider mb-2">4. Pathologie Mammaire & Gynécologique</h4>
                      <p className="text-xs text-slate-500 italic">"{obgynHistory.pathologieMammaireGyneco}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun antécédent gynéco-obstétrique enregistré pour cette patiente.</p>
                </div>
              )}
            </div>

            {obgynHistory && !modeEdition && !isReadOnly && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-1.5">
                <button 
                  onClick={() => setModeEdition(true)}
                  title="Modifier"
                  className="p-2 bg-slate-50 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"
                >
                  <IconEdit size={18} />
                </button>
                <button 
                  onClick={() => setConfirmOpen(true)}
                  title="Supprimer"
                  className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"
                >
                  <IconTrash size={18} />
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
                {importMode === 'global' ? "Importation Gynécologique Globale (CSV)" : `Importer le dossier de ${isDonorMode ? selectedPatient?.prenomD : selectedPatient?.prenomP}`}
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

      <DeleteConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="Supprimer le dossier ?" 
        message="Cette action effacera définitivement l'intégralité du registre gynéco-obstétrique." 
      />

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};