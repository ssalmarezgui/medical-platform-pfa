import { useState, useRef } from 'react';
import { useCreateDoctor } from '../hooks/useDoctors';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { IconX, IconDatabaseImport, IconFileSpreadsheet, IconLoader, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDoctorsModal = ({ isOpen, onClose }: ImportModalProps) => {
  const createDoctorMutation = useCreateDoctor();
  const { data: hospitals } = useHospitals();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      "nomM", "prenomM", "dateNaissM", "sexeM", "numTelM", 
      "numTelWhapAPPM", "adresseDomM", "specialiteM", 
      "dateDernierDiplomeM", "indexHopitalM", "typeMedecin", "autreInfo"
    ];
    
    const csvContent = "\ufeff" + headers.join(";");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_import_medecins.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) throw new Error("Le fichier ne contient pas assez de données.");
    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.replace(/^["']|["']$/g, '').trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(separator);
      if (currentLine.length < headers.length) continue;
      const rowData: any = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = (currentLine[j] || '').replace(/^["']|["']$/g, '').trim();
      }
      result.push(rowData);
    }
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMsg(null);
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setPreviewData(parseCSV(text));
      } catch (err: any) {
        setErrorMsg("Erreur lors de la lecture du fichier. Assurez-vous d'utiliser un fichier CSV valide.");
        setFile(null);
        setPreviewData([]);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleImportSubmit = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (const row of previewData) {
      const hospitalId = String(row.indexHopitalM || row.indexHopital || row.HospitalId || '').trim();
      const typeEnvoye = String(row.typeMedecin || '').trim().toUpperCase();

      const doctorDto: any = {
        nomM: String(row.nomM || row.Nom || '').trim(),
        prenomM: String(row.prenomM || row.Prenom || '').trim(),
        dateNaissM: String(row.dateNaissM || row.DateNaissance || '1980-01-01').trim(),
        sexeM: String(row.sexeM || row.Sexe || 'M').trim().toUpperCase().charAt(0),
        numTelM: String(row.numTelM || row.Telephone || '').trim(),
        numTelWhapAPPM: row.numTelWhapAPPM ? String(row.numTelWhapAPPM).trim() : null,
        adresseDomM: String(row.adresseDomM || row.Adresse || '').trim(),
        specialiteM: String(row.specialiteM || row.Specialite || '').trim(),
        dateDernierDiplomeM: String(row.dateDernierDiplomeM || row.DateDiplome || '2010-01-01').trim(),
        indexHopitalM: hospitalId,
        autreInfo: row.autreInfo ? String(row.autreInfo).trim() : null,
        typeMedecin: (typeEnvoye.includes('SUIVI') || typeEnvoye === 'SUIVI') ? 'SUIVI' : 'INVESTIGATEUR',
        service: null,
      };

      const hospitalExiste = hospitals?.some(h => h.identifiantH === hospitalId);

      if (!doctorDto.nomM || !doctorDto.prenomM || !doctorDto.numTelM || !hospitalExiste) {
        failCount++;
        continue;
      }

      try {
        await createDoctorMutation.mutateAsync(doctorDto);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      setToastType('success');
      setToastMessage(`${successCount} médecin(s) importé(s) avec succès !${failCount > 0 ? ` (${failCount} échecs)` : ''}`);
      setToastOpen(true);
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);
    } else {
      setErrorMsg("Aucun médecin n'a pu être importé. Vérifiez que l'identifiant de l'hôpital existe.");
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setErrorMsg(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2B5296]">Importer des Médecins</h2>
            <button onClick={() => { onClose(); resetModal(); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer">
              <IconX size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#A7C0E4]/50 rounded-[20px] p-8 text-center hover:bg-blue-50/30 hover:border-[#2B5296]/50 cursor-pointer transition-all flex flex-col items-center justify-center">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2B5296] mb-4">
                <IconFileSpreadsheet size={32} />
              </div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Sélectionnez un fichier</p>
              <p className="text-[10px] font-semibold text-[#6588BB]">Format accepté : .csv uniquement</p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
                <IconAlertCircle className="shrink-0" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {file && previewData.length > 0 && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#2B5296] truncate max-w-[250px]">{file.name}</span>
                  <span className="text-[10px] font-bold bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full border border-emerald-100">
                    {previewData.length} lignes détectées
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button 
                type="button" 
                onClick={handleDownloadTemplate} 
                className="bg-white border border-[#2B5296] text-[#2B5296] px-4 py-3 rounded-xl font-bold text-xs hover:bg-[#2B5296]/5 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <IconDownload size={16} />
                Télécharger modèle
              </button>

              <button 
                onClick={handleImportSubmit} 
                disabled={previewData.length === 0 || isProcessing} 
                className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20 border-none cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <IconLoader className="animate-spin" size={16} /> : <IconDatabaseImport size={16} />} 
                Lancer l'importation
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};