import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconX, IconFileSpreadsheet, IconLoader, IconDownload } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';
import axios from 'axios';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDonorsModal = ({ isOpen, onClose }: ImportModalProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreviewData([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      "nomD", "prenomD", "sexeD", "dateNaissD", "telephoneD", 
      "adresseDomD", "typeDonneur", "statut", "cinD"
    ];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_import_donneurs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
      const separator = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(separator).map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(separator);
        return headers.reduce((obj: any, header, index) => { 
          obj[header] = values[index]?.trim() || ''; 
          return obj; 
        }, {});
      });
      setPreviewData(data);
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleImport = async () => {
    setIsProcessing(true);
    let successCount = 0;
    
    for (const row of previewData) {
      try {
        await axios.post('http://localhost:8081/api/donneurs', {
          nomD: String(row.nomD || '').trim(),
          prenomD: String(row.prenomD || '').trim(),
          sexeD: String(row.sexeD || 'M').trim(),
          dateNaissD: String(row.dateNaissD || '').trim(),
          telephoneD: String(row.telephoneD || '').trim(),
          adresseDomD: String(row.adresseDomD || '').trim(),
          typeDonneur: String(row.typeDonneur || 'VIVANT').trim(),
          statut: String(row.statut || 'ACTIF').trim(),
          cinD: row.cinD ? String(row.cinD).trim() : null
        });
        successCount++;
      } catch (e) { 
        console.error("Erreur d'importation d'une ligne de donneur : ", e); 
      }
    }
    
    setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['donors'] });
    
    setToastType('success');
    setToastMessage(`${successCount} donneur(s) importé(s) avec succès !`);
    setToastOpen(true);
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm text-xs">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold text-[#2B5296]">Importer Donneurs</h2>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <IconX size={20} />
          </button>
        </div>

        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-[20px] p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          <IconFileSpreadsheet className="mx-auto text-[#2B5296] mb-4" size={32} />
          <p className="font-bold text-slate-500 uppercase">Sélectionner fichier CSV</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>

        {file && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="font-black text-[#2B5296] truncate max-w-[250px]">
                {file.name}
              </span>
              <span className="text-[10px] font-bold bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full border border-emerald-100">
                {previewData.length} lignes détectées
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={handleDownloadTemplate} 
            className="flex-1 bg-white border border-[#2B5296] text-[#2B5296] py-3 rounded-xl font-bold hover:bg-[#2B5296]/5 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <IconDownload size={16} />
            Télécharger modèle
          </button>

          <button 
            type="button" 
            onClick={handleImport} 
            disabled={isProcessing || !file} 
            className="flex-1 bg-[#2B5296] text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-900 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? <IconLoader className="animate-spin" size={16} /> : "Lancer l'import"}
          </button>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};