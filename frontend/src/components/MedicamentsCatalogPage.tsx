import { useState, useRef } from 'react';
import { useMedicamentsList, useCreateMedicament, useUpdateMedicament, useDeleteMedicament } from '../features/medicament/hooks/useMedicaments';
import { 
  IconPill, IconSearch, IconPlus, IconTrash, IconEdit, IconLoader,
  IconAlertCircle, IconActivity, IconReportMedical, IconDatabaseImport,
  IconFileSpreadsheet, IconX, IconDownload
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import { usePermission } from '../hooks/usePermission'; 

export const MedicamentsCatalogPage = () => {
  const { hasPermission } = usePermission();

  const canAccess = hasPermission('READ_PATIENT') || hasPermission('WRITE_HOPITAL');
  const isReadOnly = !hasPermission('WRITE_HOPITAL');

  const { data: medicaments, isLoading: loadingMeds } = useMedicamentsList();

  const createMutation = useCreateMedicament();
  const updateMutation = useUpdateMedicament();
  const deleteMutation = useDeleteMedicament();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const [nomCommercialMed, setNomCommercialMed] = useState('');
  const [typeMed, setTypeMed] = useState('');
  const [descriptionMed, setDescriptionMed] = useState('');
  const [posologieMed, setPosologieMed] = useState('');

  const [selectedMed, setSelectedMed] = useState<any | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!canAccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-8 px-6 bg-red-50 text-red-700 rounded-[20px] border border-red-200 font-bold text-xs">
        Accès refusé : Vous ne possédez pas les habilitations de sécurité pour consulter le catalogue de référence des médicaments.
      </div>
    );
  }

  const filteredMeds = medicaments?.filter(m => {
    const nomStr = m.nomCommercialMed?.toLowerCase() || '';
    const typeStr = m.typeMed?.toLowerCase() || '';
    const descStr = m.descriptionMed?.toLowerCase() || '';
    const query = localSearchTerm.toLowerCase();

    return nomStr.includes(query) || typeStr.includes(query) || descStr.includes(query);
  }) || [];

  const resetForm = () => {
    setSelectedMed(null);
    setNomCommercialMed('');
    setDescriptionMed('');
    setPosologieMed('');
    setTypeMed('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCommercialMed || !typeMed) return;

    const payload = {
      nomCommercialMed,
      typeMed,
      descriptionMed,
      posologieMed,
    };

    try {
      if (selectedMed) {
        await updateMutation.mutateAsync({ id: selectedMed.identifiantMed, data: payload });
        setToastMessage("Médicament de référence mis à jour !");
      } else {
        await createMutation.mutateAsync(payload);
        setToastMessage("Nouvelle molécule enregistrée au catalogue !");
      }

      setToastType('success');
      setToastOpen(true);
      resetForm();
    } catch {
      setToastType('error');
      setToastMessage("Erreur d'enregistrement.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (med: any) => {
    setSelectedMed(med);
    setNomCommercialMed(med.nomCommercialMed || '');
    setTypeMed(med.typeMed || '');
    setDescriptionMed(med.descriptionMed || '');
    setPosologieMed(med.posologieMed || '');
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
      setToastMessage("Médicament supprimé du catalogue.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = () => {
    const datasetToExport = medicaments || [];
    if (datasetToExport.length === 0) {
      alert("Aucun médicament à exporter.");
      return;
    }

    const headers = ["identifiantMed", "nomCommercialMed", "typeMed", "descriptionMed", "posologieMed"];
    const csvRows = datasetToExport.map(m => [
      m.identifiantMed || "",
      `"${String(m.nomCommercialMed || '').replace(/"/g, '""')}"`,
      `"${String(m.typeMed || '').replace(/"/g, '""')}"`,
      `"${String(m.descriptionMed || '').replace(/"/g, '""')}"`,
      `"${String(m.posologieMed || '').replace(/"/g, '""')}"`
    ].join(";"));

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_catalogue_medicaments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = ["nomCommercialMed", "typeMed", "descriptionMed", "posologieMed"];
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_import_medicaments.csv";
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
        if (row.nomCommercialMed) {
          await createMutation.mutateAsync({
            nomCommercialMed: row.nomCommercialMed,
            typeMed: row.typeMed || "Autre",
            descriptionMed: row.descriptionMed || "",
            posologieMed: row.posologieMed || ""
          });
          successCount++;
        }
      } catch (err) {
        console.error("Erreur de ligne :", err);
      }
    }

    setIsProcessing(false);
    setIsImportOpen(false);
    setFile(null);
    setPreviewData([]);
    
    setToastMessage(`${successCount} molécule(s) importée(s) au catalogue !`);
    setToastType('success');
    setToastOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 text-xs">
      
      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
              <IconPill size={24} />
              Catalogue de Référence des Médicaments
            </h2>
            <p className="text-[#6588BB] text-xs mt-2 font-semibold">
              {isReadOnly 
                ? "Consultez la liste officielle des molécules et posologies de référence autorisées au sein de l'établissement." 
                : "Enrichissez et administrez le registre des molécules thérapeutiques disponibles pour les prescriptions."}
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {!isReadOnly && (
              <button 
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
                title="Importer un fichier de molécules"
              >
                <IconDatabaseImport size={16} /> Import de Catalogue
              </button>
            )}
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors"
              title="Exporter au format CSV"
            >
              <IconFileSpreadsheet size={16} /> Export du Catalogue
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
        
        {!isReadOnly && (
          <div className="lg:col-span-1 bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm h-fit">
            <h3 className="text-base font-bold text-[#2B5296] mb-6 flex items-center gap-2">
              <IconPlus size={20} /> {selectedMed ? "Modifier la Molécule" : "Ajouter une Molécule"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Nom Commercial / Molécule *</label>
                <input type="text" value={nomCommercialMed} onChange={(e) => setNomCommercialMed(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none" placeholder="" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Type de Médicament *</label>
                <input 
                  type="text" 
                  value={typeMed} 
                  onChange={(e) => setTypeMed(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none" 
                  placeholder="" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Description</label>
                <textarea value={descriptionMed} onChange={(e) => setDescriptionMed(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none resize-none" placeholder="Description des indications..." />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Posologie Usuelle Conseillée</label>
                <input type="text" value={posologieMed} onChange={(e) => setPosologieMed(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none" placeholder="Ex: 0.1 mg/kg/jour" />
              </div>

              <div className="flex gap-2 pt-4">
                {selectedMed && (
                  <button type="button" onClick={resetForm} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">Annuler</button>
                )}
                <button type="submit" className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 border-none cursor-pointer">
                  {selectedMed ? "Sauvegarder" : "Enregistrer au Catalogue"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#A7C0E4]/30 rounded-[30px] p-8 shadow-sm min-h-[500px] flex flex-col justify-between`}>
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconActivity size={22} className="text-[#2B5296]" />
                Molécules Thérapeutiques Référencées
              </h3>

              <div className="relative w-full sm:w-64">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom ou type..." 
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loadingMeds ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#2B5296] rounded-full"></div></div>
            ) : filteredMeds && filteredMeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMeds.map((m) => (
                  <div key={m.identifiantMed} className="border border-slate-100 bg-[#F8FAFC]/50 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-[#2B5296] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase truncate max-w-[200px]">
                          {m.typeMed}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID : #{m.identifiantMed}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                        <IconPill size={16} className="text-[#6588BB]" />
                        {m.nomCommercialMed}
                      </h4>

                      <p className="text-slate-500 mt-2 text-xs leading-relaxed line-clamp-3">
                        {m.descriptionMed || "Aucune description renseignée."}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                        <p className="flex items-center gap-1.5"><IconReportMedical size={14} /> Posologie recommandée : <strong>{m.posologieMed || "Non spécifiée"}</strong></p>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end gap-1.5">
                        <button onClick={() => triggerEdit(m)} className="p-1.5 bg-slate-100 text-[#006591] hover:bg-[#DCE6F5]/50 rounded-lg border-none cursor-pointer transition-colors" title="Modifier"><IconEdit size={16} /></button>
                        <button onClick={() => triggerDelete(m.identifiantMed!)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg border-none cursor-pointer transition-colors" title="Supprimer du catalogue"><IconTrash size={16} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-[#F8FAFC]/30 rounded-2xl border border-dashed border-slate-200">
                <IconAlertCircle size={32} className="text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Aucun médicament de référence répertorié.</p>
              </div>
            )}
          </div>

          {isReadOnly && (
            <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 italic">
              * Consultation : Vous disposez d'un accès en lecture seule sur le catalogue général.
            </div>
          )}
        </div>

      </div>

      {isImportOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-[#2B5296]">
                Importation en masse de Molécules (CSV)
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
                onClick={handleDownloadTemplate} 
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

      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la molécule ?" message="Cette action retirera définitivement ce médicament du registre de prescription officiel hospitalier." />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};