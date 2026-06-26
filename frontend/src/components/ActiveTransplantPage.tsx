import { useState, useRef, useEffect } from 'react';
import { useTransplantActiveHistory, useCreateTransplantActive, useDeleteTransplantActive } from '../features/transplant-active/hooks/useTransplantActive';
import { usePatients } from '../features/patients/hooks/usePatients';
import { useQueryClient } from '@tanstack/react-query';
import { transplantActiveService } from '../features/transplant-active/api/transplantActiveService';
import { 
  IconHeartbeat, IconSearch, IconPlus, IconTrash, IconUserCheck, IconAlertCircle, IconCalendar, IconBuildingHospital, IconEdit,
  IconFileSpreadsheet, IconDatabaseImport, IconX, IconLoader, IconDownload, IconFolderOpen, IconInfoCircle
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';

export const ActiveTransplantPage = () => {
  const queryClient = useQueryClient();
  const { data: patients } = usePatients();
  
  // --- ÉTATS DE SÉLECTION DU PATIENT ---
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const patientIdString = selectedPatientId ? String(selectedPatientId) : '';
  
  const { data: transplants, isLoading } = useTransplantActiveHistory(patientIdString || undefined);
  const createMutation = useCreateTransplantActive();
  const deleteMutation = useDeleteTransplantActive(patientIdString);

  // --- RECHERCHE LOCALE (Vue Personnelle) ---
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // États du formulaire chirurgical
  const [dateTR, setDateTR] = useState('');
  const [lieuDeLaGreffe, setLieuDeLaGreffe] = useState('');
  const [lieuDeSuivi, setLieuDeSuivi] = useState('');
  const [nbTransplantation, setNbTransplantation] = useState(1);
  const [nbUretere, setNbUretere] = useState(1);
  const [rein, setRein] = useState<'Gauche' | 'Droit'>('Gauche');
  const [nbArtereVeine, setNbArtereVeine] = useState(1);
  const [kystes, setKystes] = useState(false);
  const [typeAnomalie, setTypeAnomalie] = useState('');
  const [dureeIschemieFroide, setDureeIschemieFroide] = useState(0);
  const [dureeIschemieChaude, setDureeIschemieChaude] = useState(0);
  const [liquideConservation, setLiquideConservation] = useState('');
  const [liquideRincage, setLiquideRincage] = useState('');
  const [machineAPerfusion, setMachineAPerfusion] = useState(false);
  const [typeAnastomoseArterielle, setTypeAnastomoseArterielle] = useState('');
  const [typeAnastomoseVeineuse, setTypeAnastomoseVeineuse] = useState('');
  const [typeAnastomoseUreteroVesicale, setTypeAnastomoseUreteroVesicale] = useState('');
  const [sondeEnDoubleJJ, setSondeEnDoubleJJ] = useState(false);

  // Liaison Donneur (ID numérique)
  const [donneurId, setDonneurId] = useState('');

  // Édition
  const [selectedTransplant, setSelectedTransplant] = useState<any | null>(null);

  // Toasts
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

  // Filtrage local des greffes actives (Vue Personnelle)
  const filteredLocalTransplants = transplants?.filter(tr => {
    const placeStr = tr.lieuDeLaGreffe?.toLowerCase() || '';
    const anastomosisStr = tr.typeAnastomoseArterielle?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return placeStr.includes(query) || anastomosisStr.includes(query);
  }) || [];

  const selectedPatient = patients?.find(p => p.identifiantP === selectedPatientId);

  // Remplissage automatique
  useEffect(() => {
    if (selectedTransplant) {
      setDateTR(selectedTransplant.dateTR);
      setLieuDeLaGreffe(selectedTransplant.lieuDeLaGreffe);
      setLieuDeSuivi(selectedTransplant.lieuDeSuivi);
      setNbTransplantation(selectedTransplant.nbTransplantation);
      setNbUretere(selectedTransplant.nbUretere);
      setRein(selectedTransplant.rein);
      setNbArtereVeine(selectedTransplant.nbArtereVeine);
      setKystes(selectedTransplant.kystes);
      setTypeAnomalie(selectedTransplant.typeAnomalie || '');
      setDureeIschemieFroide(selectedTransplant.dureeIschemieFroide || 0);
      setDureeIschemieChaude(selectedTransplant.dureeIschemieChaude || 0);
      setLiquideConservation(selectedTransplant.liquideConservation);
      setLiquideRincage(selectedTransplant.liquideRincage);
      setMachineAPerfusion(selectedTransplant.machineAPerfusion);
      setTypeAnastomoseArterielle(selectedTransplant.typeAnastomoseArterielle);
      setTypeAnastomoseVeineuse(selectedTransplant.typeAnastomoseVeineuse);
      setTypeAnastomoseUreteroVesicale(selectedTransplant.typeAnastomoseUreteroVesicale);
      setSondeEnDoubleJJ(selectedTransplant.sondeEnDoubleJJ);
      setDonneurId(String(selectedTransplant.donneurId || ''));
    }
  }, [selectedTransplant]);

  const resetForm = () => {
    setSelectedTransplant(null);
    setDateTR('');
    setLieuDeLaGreffe('');
    setLieuDeSuivi('');
    setNbTransplantation(1);
    setNbUretere(1);
    setNbArtereVeine(1);
    setKystes(false);
    setTypeAnomalie('');
    setDureeIschemieFroide(0);
    setDureeIschemieChaude(0);
    setLiquideConservation('');
    setLiquideRincage('');
    setMachineAPerfusion(false);
    setTypeAnastomoseArterielle('');
    setTypeAnastomoseVeineuse('');
    setTypeAnastomoseUreteroVesicale('');
    setSondeEnDoubleJJ(false);
    setDonneurId('');
  };

  // Enregistrer / Modifier
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !donneurId || !dateTR) return;

    const payload = {
      dateTR,
      lieuDeLaGreffe,
      lieuDeSuivi,
      nbTransplantation: Number(nbTransplantation),
      nbUretere: Number(nbUretere),
      rein,
      nbArtereVeine: Number(nbArtereVeine),
      kystes: !!kystes,
      typeAnomalie,
      dureeIschemieFroide: Number(dureeIschemieFroide),
      dureeIschemieChaude: Number(dureeIschemieChaude),
      liquideConservation,
      liquideRincage,
      machineAPerfusion: !!machineAPerfusion,
      typeAnastomoseArterielle,
      typeAnastomoseVeineuse,
      typeAnastomoseUreteroVesicale,
      sondeEnDoubleJJ: !!sondeEnDoubleJJ,
      patientId: patientIdString,
      donneurId: Number(donneurId),
    };

    try {
      if (selectedTransplant) {
        await transplantActiveService.update(selectedTransplant.numeroTR, payload);
        queryClient.invalidateQueries({ queryKey: ['transplantActiveHistory', patientIdString] });
        setToastMessage("Dossier chirurgical de greffe mis à jour !");
      } else {
        await createMutation.mutateAsync({ patientId: patientIdString, donneurId: Number(donneurId), data: payload });
        setToastMessage("Dossier de transplantation active enregistré !");
      }

      setToastType('success');
      setToastOpen(true);
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement : vérifiez l'existence du donneur.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (tr: any) => {
    setSelectedTransplant(tr);
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
      setToastMessage("Dossier de transplantation supprimé.");
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
      filename = `export_greffes_actives_patient_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      try {
        const globalData = await transplantActiveService.getByPatientId('');
        datasetToExport = globalData || [];
        filename = `export_global_greffes_actives_${new Date().toISOString().split('T')[0]}.csv`;
      } catch {
        alert("Erreur lors de l'export global.");
        return;
      }
    }

    if (datasetToExport.length === 0) {
      alert("Aucune greffe active à exporter.");
      return;
    }

    const headers = ["numeroTR", "patientId", "donneurId", "dateTR", "lieuDeLaGreffe", "lieuDeSuivi", "nbTransplantation", "nbUretere", "rein", "nbArtereVeine", "kystes", "typeAnomalie", "dureeIschemieFroide", "dureeIschemieChaude", "liquideConservation", "liquideRincage", "machineAPerfusion", "typeAnastomoseArterielle", "typeAnastomoseVeineuse", "typeAnastomoseUreteroVesicale", "sondeEnDoubleJJ"];
    const csvRows = datasetToExport.map(tr => [
      tr.numeroTR || "",
      tr.patientId || tr.patient?.identifiantP || "",
      tr.donneurId || tr.donneur?.identifiantD || "",
      tr.dateTR || "",
      `"${String(tr.lieuDeLaGreffe || '').replace(/"/g, '""')}"`,
      `"${String(tr.lieuDeSuivi || '').replace(/"/g, '""')}"`,
      tr.nbTransplantation || 1,
      tr.nbUretere || 1,
      tr.rein || "Gauche",
      tr.nbArtereVeine || 1,
      tr.kystes ? "true" : "false",
      `"${String(tr.typeAnomalie || '').replace(/"/g, '""')}"`,
      tr.dureeIschemieFroide || 0,
      tr.dureeIschemieChaude || 0,
      `"${String(tr.liquideConservation || '').replace(/"/g, '""')}"`,
      `"${String(tr.liquideRincage || '').replace(/"/g, '""')}"`,
      tr.machineAPerfusion ? "true" : "false",
      `"${String(tr.typeAnastomoseArterielle || '').replace(/"/g, '""')}"`,
      `"${String(tr.typeAnastomoseVeineuse || '').replace(/"/g, '""')}"`,
      `"${String(tr.typeAnastomoseUreteroVesicale || '').replace(/"/g, '""')}"`,
      tr.sondeEnDoubleJJ ? "true" : "false"
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
      ? ["patientId", "donneurId", "dateTR", "lieuDeLaGreffe", "lieuDeSuivi", "nbTransplantation", "nbUretere", "rein", "nbArtereVeine", "kystes", "typeAnomalie", "dureeIschemieFroide", "dureeIschemieChaude", "liquideConservation", "liquideRincage", "machineAPerfusion", "typeAnastomoseArterielle", "typeAnastomoseVeineuse", "typeAnastomoseUreteroVesicale", "sondeEnDoubleJJ"]
      : ["donneurId", "dateTR", "lieuDeLaGreffe", "lieuDeSuivi", "nbTransplantation", "nbUretere", "rein", "nbArtereVeine", "kystes", "typeAnomalie", "dureeIschemieFroide", "dureeIschemieChaude", "liquideConservation", "liquideRincage", "machineAPerfusion", "typeAnastomoseArterielle", "typeAnastomoseVeineuse", "typeAnastomoseUreteroVesicale", "sondeEnDoubleJJ"];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === 'global' ? "modele_import_greffes_actives_global.csv" : "modele_import_greffes_actives_personnel.csv";
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
          lieuDeLaGreffe: row.lieuDeLaGreffe,
          lieuDeSuivi: row.lieuDeSuivi || 'Non précisé',
          nbTransplantation: Number(row.nbTransplantation || 1),
          nbUretere: Number(row.nbUretere || 1),
          rein: row.rein || "Gauche",
          nbArtereVeine: Number(row.nbArtereVeine || 1),
          kystes: row.kystes === 'true',
          typeAnomalie: row.typeAnomalie || '',
          dureeIschemieFroide: Number(row.dureeIschemieFroide || 0),
          dureeIschemieChaude: Number(row.dureeIschemieChaude || 0),
          liquideConservation: row.liquideConservation || '',
          liquideRincage: row.liquideRincage || '',
          machineAPerfusion: row.machineAPerfusion === 'true',
          typeAnastomoseArterielle: row.typeAnastomoseArterielle || '',
          typeAnastomoseVeineuse: row.typeAnastomoseVeineuse || '',
          typeAnastomoseUreteroVesicale: row.typeAnastomoseUreteroVesicale || '',
          sondeEnDoubleJJ: row.sondeEnDoubleJJ === 'true'
        };

        const targetPatientId = importMode === 'global' ? row.patientId : patientIdString;
        const targetDonneurId = Number(row.donneurId || donneurId);
        
        if (targetPatientId && targetDonneurId) {
          await transplantActiveService.create(targetPatientId, targetDonneurId, payload);
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
    
    setToastMessage(`${successCount} dossier(s) de greffe active(s) importé(s) !`);
    setToastType('success');
    setToastOpen(true);
    
    queryClient.invalidateQueries({ queryKey: ['transplantActiveHistory', patientIdString] });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      {/* 1. SELECTION DU PATIENT AVEC BARRE DE RECHERCHE */}
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
            <IconUserCheck size={24} />
            Dossier Clinique de Transplantation
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
            <h3 className="text-base font-bold text-slate-800">Registre de Transplantation Active de la Cohorte</h3>
            <p className="text-[#6588BB] text-xs mt-0.5 font-semibold font-sans">Visualisez et importez les actes chirurgicaux opératoires de vos patients suivis.</p>
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
              <IconPlus size={20} /> {selectedTransplant ? "Modifier la Fiche" : "Saisir une Greffe Active"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              {/* Liaison Donneur */}
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Identifiant Unique du Donneur (ID numérique) *</label>
                <input type="number" value={donneurId} onChange={(e) => setDonneurId(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#2B5296]" placeholder="Saisir ID du donneur" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Date Opération *</label>
                  <input type="date" value={dateTR} onChange={(e) => setDateTR(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu de greffe *</label>
                  <input type="text" value={lieuDeLaGreffe} onChange={(e) => setLieuDeLaGreffe(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200" placeholder="Ex: CHN" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Lieu de suivi</label>
                  <input type="text" value={lieuDeSuivi} onChange={(e) => setLieuDeSuivi(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200" placeholder="CHN" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Côté du rein greffé *</label>
                  <select value={rein} onChange={(e: any) => setRein(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold">
                    <option value="Gauche">Gauche</option>
                    <option value="Droit">Droit</option>
                  </select>
                </div>
              </div>

              {/* Paramètres d'ischémie */}
              <div className="grid grid-cols-2 gap-2 border-t pt-3">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Ischémie froide (h)</label>
                  <input type="number" min={0} value={dureeIschemieFroide} onChange={(e) => setDureeIschemieFroide(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Ischémie chaude (min)</label>
                  <input type="number" min={0} value={dureeIschemieChaude} onChange={(e) => setDureeIschemieChaude(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white" />
                </div>
              </div>

              {/* Solutés de conservation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Liquide conservation</label>
                  <input type="text" value={liquideConservation} onChange={(e) => setLiquideConservation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white" placeholder="" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Liquide rinçage</label>
                  <input type="text" value={liquideRincage} onChange={(e) => setLiquideRincage(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white" />
                </div>
              </div>

              {/* Anastomoses */}
              <div className="border-t pt-3 space-y-3">
                <h4 className="text-[10px] font-black text-[#2B5296] uppercase mb-2">Techniques d'Anastomoses</h4>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Anastomose Artérielle</label>
                  <input type="text" value={typeAnastomoseArterielle} onChange={(e) => setTypeAnastomoseArterielle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white" placeholder="" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Anastomose Veineuse</label>
                  <input type="text" value={typeAnastomoseVeineuse} onChange={(e) => setTypeAnastomoseVeineuse(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Anastomose Uretéro-Vésicale</label>
                  <input type="text" value={typeAnastomoseUreteroVesicale} onChange={(e) => setTypeAnastomoseUreteroVesicale(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white" placeholder="" />
                </div>
              </div>

              {/* Paramètres Binaires */}
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={machineAPerfusion} onChange={(e) => setMachineAPerfusion(e.target.checked)} className="rounded" />
                  <span>Machine à perfusion</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={sondeEnDoubleJJ} onChange={(e) => setSondeEnDoubleJJ(e.target.checked)} className="rounded" />
                  <span>Sonde en Double JJ</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedTransplant && (
                  <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
                  {selectedTransplant ? "Sauvegarder" : "Enregistrer"}
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
                    Dossier d'Actes de Transplantation Active ({selectedPatient?.prenomP} {selectedPatient?.nomP})
                  </h3>
                </div>

                {/* ACTIONS LOCALES DE L'ETAT B */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par lieu ou rein..." 
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

              {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
              ) : filteredLocalTransplants && filteredLocalTransplants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLocalTransplants.map((tr) => (
                    <div key={tr.numeroTR} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                            Greffe du : {tr.dateTR}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500">
                            Rein : {tr.rein}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t pt-3">
                          <p><IconBuildingHospital size={14} className="inline mr-1" /> Lieu : <strong>{tr.lieuDeLaGreffe}</strong> (Suivi: {tr.lieuDeSuivi})</p>
                          <p className="text-blue-600"><strong>Donneur ID :</strong> #{tr.donneurId}</p>
                          <p>Ischémie Froide/Chaude : <strong>{tr.dureeIschemieFroide} min / {tr.dureeIschemieChaude} min</strong></p>
                          <p>Machine perfusion : <strong>{tr.machineAPerfusion ? "Oui" : "Non"}</strong></p>
                          <p>Sonde Double JJ : <strong>{tr.sondeEnDoubleJJ ? "Oui" : "Non"}</strong></p>
                          <p className="text-slate-500 italic mt-2 border-t pt-2"><IconInfoCircle size={14} className="inline mr-1" /> Anastomose Artérielle : {tr.typeAnastomoseArterielle}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                        <button onClick={() => triggerEdit(tr)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors"><IconEdit size={16} /></button>
                        <button onClick={() => triggerDelete(tr.numeroTR!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors"><IconTrash size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                  <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Aucun acte opératoire de transplantation active enregistré pour ce patient.</p>
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
                {importMode === 'global' ? "Importation de Cohorte Active (CSV)" : `Importer le dossier de ${selectedPatient?.prenomP}`}
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
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la greffe active ?" message="Cette action effacera définitivement ce dossier chirurgical de greffe active du patient." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};