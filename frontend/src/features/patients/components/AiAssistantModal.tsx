import { useState } from 'react';
import { useGenerateSummary, useGenerateReport } from '../hooks/usePatientAi';
import { Patient } from '../types/patients';
import { marked } from 'marked';
import { 
  IconX, 
  IconLoader, 
  IconSparkles, 
  IconFileText, 
  IconCopy, 
  IconCheck, 
  IconPrinter 
} from '@tabler/icons-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const AiAssistantModal = ({ isOpen, onClose, patient }: AiAssistantModalProps) => {
  const generateSummaryMutation = useGenerateSummary();
  const generateReportMutation = useGenerateReport();

  const [aiResult, setAiResult] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<'idle' | 'generating_summary' | 'generating_report'>('idle');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPending = generateSummaryMutation.isPending || generateReportMutation.isPending;

  const handleGenerateSummary = async () => {
    setAiResult('');
    setCurrentAction('generating_summary');
    try {
      const result = await generateSummaryMutation.mutateAsync(patient.identifiantP);
      setAiResult(result);
    } catch (err) {
      setAiResult("Une erreur est survenue lors de la communication avec l'IA NephroCare.");
    } finally {
      setCurrentAction('idle');
    }
  };

  const handleGenerateReport = async () => {
    setAiResult('');
    setCurrentAction('generating_report');
    try {
      const result = await generateReportMutation.mutateAsync(patient.identifiantP);
      setAiResult(result);
    } catch (err) {
      setAiResult("Une erreur est survenue lors de la communication avec l'IA NephroCare.");
    } finally {
      setCurrentAction('idle');
    }
  };

  const handleCopyToClipboard = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const parsedHtml = marked(aiResult);

    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Médical - ${patient.identifiantP}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1, h2, h3 { color: #2B5296; margin-top: 20px; font-weight: bold; }
            h1 { border-bottom: 2px solid #2B5296; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
            h2 { font-size: 18px; }
            h3 { font-size: 16px; }
            p { margin-bottom: 12px; font-size: 14px; }
            ul { margin-bottom: 12px; padding-left: 20px; font-size: 14px; }
            li { margin-bottom: 6px; }
            strong { font-weight: bold; color: #0f172a; }
            hr { border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0; }
          </style>
        </head>
        <body>
          <h1>Rapport Médical Clinique - NephroCare</h1>
          <div>${parsedHtml}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const renderMarkdown = (markdownText: string) => {
    const rawHtml = marked(markdownText) as string;
    return (
      <>
        <style>{`
          .markdown-content h1 { font-size: 1.4rem; font-weight: 700; color: #2B5296; margin-top: 1.5rem; margin-bottom: 0.5rem; }
          .markdown-content h2 { font-size: 1.2rem; font-weight: 700; color: #2B5296; margin-top: 1.25rem; margin-bottom: 0.5rem; }
          .markdown-content h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin-top: 1rem; margin-bottom: 0.5rem; }
          .markdown-content p { margin-bottom: 0.75rem; font-size: 13px; color: #334155; }
          .markdown-content ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; font-size: 13px; }
          .markdown-content li { margin-bottom: 0.35rem; color: #334155; }
          .markdown-content strong { font-weight: 700; color: #0f172a; }
          .markdown-content hr { margin: 1.5rem 0; border: 0; border-top: 1px solid #e2e8f0; }
        `}</style>
        <div 
          className="markdown-content select-text leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rawHtml }} 
        />
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#2B5296] flex items-center gap-2">
              <IconSparkles className="text-blue-500 animate-pulse" size={24} /> 
              Assistant Clinique IA NephroCare
            </h2>
            <p className="text-slate-400 text-xs mt-1">Génération automatique assistée pour l'ID : <strong className="text-slate-700">{patient.identifiantP}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 min-h-[250px] bg-slate-50 border border-slate-100 rounded-2xl p-6 relative">
          
          {isPending ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/80 backdrop-blur-xs">
              <IconLoader className="animate-spin text-[#2B5296] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-900">
                {currentAction === 'generating_summary' ? "L'IA rédige votre synthèse clinique..." : "L'IA rédige votre rapport médical officiel..."}
              </h3>
              <p className="text-[#6588BB] text-[11px] mt-1 font-semibold">Analyse sécurisée des constantes locales en cours. Veuillez patienter.</p>
            </div>
          ) : aiResult ? (
            renderMarkdown(aiResult)
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full p-6 text-slate-400">
              <IconSparkles size={36} className="text-blue-200 mb-2" />
              <p className="font-bold">Prêt pour l'analyse clinique assistée</p>
              <p className="text-[11px] max-w-xs mt-1">Sélectionnez l'une des actions ci-dessous pour lancer l'IA générative locale NephroCare.</p>
            </div>
          )}

        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100 shrink-0">
          
          <div className="flex gap-2">
            {aiResult && !isPending && (
              <>
                <button 
                  onClick={handleCopyToClipboard}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  {copied ? <IconCheck className="text-emerald-500" size={16} /> : <IconCopy size={16} />}
                  {copied ? "Copié !" : "Copier"}
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <IconPrinter size={16} />
                  Imprimer / PDF
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isPending}
              className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              Fermer
            </button>
            <button 
              onClick={handleGenerateSummary} 
              disabled={isPending}
              className="bg-blue-50 text-[#2B5296] hover:bg-blue-100 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border-none cursor-pointer disabled:opacity-50 transition-colors"
            >
              <IconSparkles size={16} /> Synthèse rapide
            </button>
            <button 
              onClick={handleGenerateReport} 
              disabled={isPending}
              className="bg-[#2B5296] text-white hover:bg-blue-900 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border-none cursor-pointer disabled:opacity-50 transition-colors"
            >
              <IconFileText size={16} /> Rapport Officiel
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};