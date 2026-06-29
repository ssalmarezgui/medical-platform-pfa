import { useState } from 'react';
import { usePatients, useDeletePatient } from '../features/patients/hooks/usePatients';
import { IconSearch, IconPlus, IconFileSpreadsheet, IconTrash, IconEdit, IconPhone, IconMapPin, IconCalendar, IconGenderMale, IconGenderFemale, IconDatabaseImport } from '@tabler/icons-react';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import { AddPatientModal } from '../features/patients/components/AddPatientModal';
import { EditPatientModal } from '../features/patients/components/EditPatientModal';
import { ImportPatientsModal } from '../features/patients/components/ImportPatientsModal';
import { useHospitals } from '../features/hospitals/hooks/useHospitals';
import { Patient } from '../features/patients/types/patients';
// Importation du store d'authentification globale
import { useAuthStore } from '../store/useAuthStore';

export const PatientPage = () => {
  // Récupération de l'utilisateur connecté et de son hôpital de rattachement choisi à la connexion
  const { user } = useAuthStore();
  const userHopitalId = user?.hopitalId;

  const { data: hospitals } = useHospitals();
  const deletePatientMutation = useDeletePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Évaluation des permissions selon le rôle clinique de l'utilisateur
  const isReadOnly = user?.roleU === 'MEDECIN_SUIVI'; // R uniquement
  const canCreateOrUpdate = user?.roleU === 'ADMIN' || user?.roleU === 'MEDECIN_INVESTIGATEUR'; // C/U autorisés
  const canDelete = user?.roleU === 'ADMIN'; // D autorisé

  // export CSV
  const handleExportCSV = () => {
    if (!patients || patients.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const headers = [
      "identifiantP", "nomP", "prenomP", "sexeP", "dateNaissP", 
      "telephoneP", "adresseP", "statut", "nationaliteP"
    ];

    const csvRows = patients.map(p => 
      headers.map(h => {
        const val = p[h as keyof typeof p] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(";")
    );

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_patients_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('');

  // Appel de la requête avec l'hôpital de connexion ou le filtre de recherche de l'administrateur
  const { data: patients, isLoading } = usePatients(
    undefined, 
    undefined, 
    userHopitalId || selectedHospitalFilter || undefined
  );

  const sansAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredPatients = patients?.filter(p => {
    const nomComplet = sansAccents(`${p.prenomP} ${p.nomP}`.toLowerCase());
    const recherchePropre = sansAccents(searchTerm.toLowerCase());
    return nomComplet.includes(recherchePropre) || (p.numeroCin && String(p.numeroCin).includes(recherchePropre));
  });

  const triggerDelete = (id: string) => { 
    setIdToDelete(id); 
    setConfirmOpen(true); 
  };
  
  const handleConfirmDelete = async () => {
    if (idToDelete === null) return;
    await deletePatientMutation.mutateAsync(idToDelete);
    setConfirmOpen(false);
  };

  if (isLoading) return <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-b-2 border-[#2B5296] rounded-full"></div></div>;

  return (
    <div className="max-w-[1440px] mx-auto p-6 text-xs">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Registre des Patients</h1>
            <p className="text-[#6588BB] text-sm">Gestion complète des dossiers d'admission.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
  
        {/* Seul l'administrateur global peut voir et manipuler ce filtre d'établissement */}
        {user?.roleU === 'ADMIN' && (
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#2B5296] outline-none w-full sm:w-auto"
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
          >
            <option value="">Tous les établissements</option>
            {hospitals?.map(h => (
              <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
            ))}
          </select>
        )}

        <div className="relative w-full sm:w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
            placeholder="Rechercher par nom ou CIN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bouton d'importation masqué pour le médecin de suivi (R) */}
        {canCreateOrUpdate && (
          <button 
            onClick={() => setIsImportOpen(true)}
            title="Importer des données"
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <IconDatabaseImport size={18} />
          </button>
        )}

        <button onClick={handleExportCSV} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
          <IconFileSpreadsheet size={18} />
        </button>
        
        {/* Bouton d'admission masqué pour le médecin de suivi (R) */}
        {canCreateOrUpdate && (
          <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 flex items-center gap-2 border-none cursor-pointer">
            <IconPlus size={16} /> Admission
          </button>
        )}
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients?.map((p) => (
          <div key={p.identifiantP} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                           
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                p.sexeP === 'M'
                  ? 'bg-blue-50 text-[#2B5296]' 
                  : 'bg-pink-50 text-pink-500'
              }`}>
                {p.sexeP === 'M'
                  ? <IconGenderMale size={24} /> 
                  : <IconGenderFemale size={24} />
                }
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-[#2B5296] px-3 py-1 rounded-full uppercase">{p.statut}</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">{p.prenomP} {p.nomP}</h3>
            <p className="text-[11px] text-[#6588BB] font-mono mb-4">ID: {p.identifiantP} | CIN: {p.numeroCin}</p>

            <div className="space-y-2 border-t pt-4 text-xs text-slate-600">
                <p className="flex items-center gap-2"><IconPhone size={16} /> {p.telephoneP}</p>
                <p className="flex items-center gap-2"><IconMapPin size={16} /> {p.adresseP}</p>
                <p className="flex items-center gap-2"><IconCalendar size={16} /> Né(e) le : {p.dateNaissP}</p>
                <p className="font-bold text-[#2B5296]">Carnet: {p.typeCarnetP} ({p.numCarnetP})</p>
            </div>

            {/* Le bloc d'actions complet est masqué si l'utilisateur est médecin de suivi (R) */}
            {canCreateOrUpdate && (
              <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                {/* Le bouton de modification reste visible pour l'investigateur et l'admin (U) */}
                <button onClick={() => { setSelectedPatient(p); setIsEditOpen(true); }} className="p-2 bg-slate-50 text-[#2B5296] cursor-pointer rounded-lg">
                  <IconEdit size={16} />
                </button>
                
                {/* Le bouton de suppression s'affiche uniquement pour l'admin (D) */}
                {canDelete && (
                  <button onClick={() => triggerDelete(p.identifiantP)} className="p-2 bg-red-50 text-red-600 cursor-pointer rounded-lg">
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddPatientModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {selectedPatient && (
        <EditPatientModal 
          isOpen={isEditOpen} 
          onClose={() => { setIsEditOpen(false); setSelectedPatient(null); }} 
          patient={selectedPatient} 
        />
      )}
      
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Supprimer ?" message="Supprimer le dossier ?" />

      <ImportPatientsModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
};