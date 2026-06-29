import { useState } from 'react';
import { useDonors } from '../features/donors/hooks/useDonors';
import { useHospitals } from '../features/hospitals/hooks/useHospitals';
import { useQueryClient } from '@tanstack/react-query';
import { 
  IconUsers, IconSearch, IconPlus, IconPhone, IconMapPin, IconCalendar, IconHeartbeat, IconEdit, IconTrash,
  IconGenderMale, IconGenderFemale, IconFileSpreadsheet, IconDatabaseImport
} from '@tabler/icons-react';
import { AddDonorModal } from '../features/donors/components/AddDonorModal';
import { ImportDonorsModal } from '../features/donors/components/ImportDonorsModal'; 
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import { Toast } from './ui/Toast';
import axios from 'axios';
// Importation du store d'authentification globale
import { useAuthStore } from '../store/useAuthStore';

export const DonorPage = () => {
  // Récupération de l'utilisateur connecté et de son hôpital de rattachement choisi à la connexion
  const { user } = useAuthStore();
  const userHopitalId = user?.hopitalId;

  const queryClient = useQueryClient();
  const { data: hospitals } = useHospitals();
  
  // États de recherche et de filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('');

  // DECLARATION DES RÔLES ET HABILITATIONS (Correction de l'erreur de compilation)
  const isReadOnly = user?.roleU === 'MEDECIN_SUIVI'; // R uniquement
  const canCreateOrUpdate = user?.roleU === 'ADMIN' || user?.roleU === 'MEDECIN_INVESTIGATEUR'; // C/U
  const canDelete = user?.roleU === 'ADMIN'; // D

  // Chargement des données des donneurs (Filtre par hôpital de connexion prioritaire, ou par recherche admin)
  const { data: donors, isLoading, error } = useDonors(
    undefined, 
    userHopitalId || selectedHospitalFilter || undefined
  );
  
  // États de contrôle pour le Modal d'Ajout/Édition
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);

  // États pour la suppression sécurisée
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // États pour les Toasts de notification
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Export CSV conforme au format du registre
  const handleExportCSV = () => {
    if (!donors || donors.length === 0) {
      alert("Aucune donnée de donneur à exporter.");
      return;
    }

    const headers = [
      "identifiantD", "nomD", "prenomD", "sexeD", "dateNaissD", 
      "telephoneD", "adresseDomD", "typeDonneur", "statut", "cinD"
    ];

    const csvRows = donors.map(d => 
      headers.map(h => {
        const val = d[h as keyof typeof d] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(";")
    );

    const csvContent = "\ufeff" + [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_donneurs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sansAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Filtrage dynamique local (recherche par nom ou CIN)
  const filteredDonors = donors?.filter(d => {
    const nomComplet = sansAccents(`${d.prenomD} ${d.nomD}`.toLowerCase());
    const recherchePropre = sansAccents(searchTerm.toLowerCase());
    return nomComplet.includes(recherchePropre) || (d.cinD && String(d.cinD).includes(recherchePropre));
  });

  const estVide = !donors || donors.length === 0;

  // Ouvrir le modal d'édition
  const triggerEdit = (donor: any) => {
    setSelectedDonor(donor);
    setIsAddOpen(true);
  };

  // Fermer le modal d'admission/édition
  const handleCloseModal = () => {
    setIsAddOpen(false);
    setSelectedDonor(null);
  };

  // Ouvrir le modal de confirmation de suppression
  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  // Traiter la suppression physique
  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      await axios.delete(`http://localhost:8081/api/donneurs/${idToDelete}`);
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("La fiche du donneur a été supprimée avec succès !");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression du dossier.");
      setToastOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-[#2B5296] rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-semibold">
        Erreur de connexion au serveur de base de données.
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-6 text-xs">
      
      {/* 1. Header principal */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registre des Donneurs</h1>
          <p className="text-[#6588BB] text-sm mt-1">Gestion et admission des donneurs de greffons (vivants ou décédés).</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Filtre Hôpital : Visible uniquement par l'ADMIN global */}
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

          {/* Barre de recherche par ID/Nom */}
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
              placeholder="Rechercher par nom ou CIN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bouton d'importation : Masqué pour le médecin de suivi (R) */}
          {canCreateOrUpdate && (
            <button 
              onClick={() => setIsImportOpen(true)}
              title="Importer des donneurs (CSV)"
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <IconDatabaseImport size={18} />
            </button>
          )}

          {/* Bouton d'exportation */}
          <button 
            onClick={handleExportCSV} 
            title="Exporter la liste (CSV)"
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <IconFileSpreadsheet size={18} />
          </button>
          
          {/* Bouton Enregistrement d'un donneur : Masqué pour le médecin de suivi (R) */}
          {canCreateOrUpdate && (
            <button 
              onClick={() => setIsAddOpen(true)} 
              className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#203F75] flex items-center gap-2 border-none cursor-pointer w-full sm:w-auto justify-center"
            >
              <IconPlus size={16} /> Enregistrer un Donneur
            </button>
          )}
        </div>
      </div>

      {/* 2. Affichage des fiches ou de la boîte vide */}
      {estVide ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white border border-slate-100 rounded-[30px] p-12 text-center shadow-sm">
          <IconUsers size={48} className="text-[#6588BB] mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun donneur enregistré</h3>
          <p className="text-[#6588BB] text-xs max-w-xs mb-6">
            {isReadOnly 
              ? "Le registre des donneurs est vide." 
              : "Ajoutez les premiers donneurs pour pouvoir réaliser des transplantations rénales."}
          </p>
          {canCreateOrUpdate && (
            <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#203F75] flex items-center gap-2 border-none cursor-pointer">
              Enregistrer le premier donneur
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors?.map((d) => (
            <div key={d.identifiantD} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  {/* Icône de genre conditionnelle */}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                    d.sexeD === 'M' || d.sexeD === 'Masculin'
                      ? 'bg-blue-50 text-[#2B5296]' 
                      : 'bg-pink-50 text-pink-500'
                  }`}>
                    {d.sexeD === 'M' || d.sexeD === 'Masculin'
                      ? <IconGenderMale size={24} /> 
                      : <IconGenderFemale size={24} />
                    }
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-[#2B5296] px-3 py-1 rounded-full uppercase">
                    {d.typeDonneur}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900">{d.prenomD} {d.nomD}</h3>
                <p className="text-[11px] text-[#6588BB] font-mono mb-4">ID : #{d.identifiantD} | CIN : {d.cinD || 'N/A'}</p>

                <div className="space-y-2 border-t pt-4 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><IconPhone size={16} /> {d.telephoneD}</p>
                  <p className="flex items-center gap-2"><IconMapPin size={16} /> {d.adresseDomD}</p>
                  <p className="flex items-center gap-2"><IconCalendar size={16} /> Né(e) le : {d.dateNaissD}</p>
                  <p className="flex items-center gap-2 text-emerald-600 font-bold"><IconHeartbeat size={16} /> Statut : {d.statut}</p>
                </div>
              </div>

              {/* Barre d'actions au bas de la carte (masquée si l'utilisateur est médecin de suivi / R seul) */}
              {canCreateOrUpdate && (
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end gap-2">
                  {/* Le bouton d'édition est visible pour l'investigateur et l'admin (U) */}
                  <button onClick={() => triggerEdit(d)} className="p-2 bg-slate-50 text-[#2B5296] cursor-pointer rounded-lg border-none hover:bg-slate-100" title="Modifier">
                    <IconEdit size={16} />
                  </button>
                  
                  {/* Le bouton de suppression s'affiche uniquement pour l'admin (D) */}
                  {canDelete && (
                    <button onClick={() => triggerDelete(d.identifiantD)} className="p-2 bg-red-50 text-red-600 cursor-pointer rounded-lg border-none hover:bg-red-100" title="Supprimer">
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals & Toasts d'accompagnement */}
      <AddDonorModal isOpen={isAddOpen} onClose={handleCloseModal} donor={selectedDonor} />
      
      <DeleteConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Supprimer la fiche du donneur ?" message="Cette action effacera définitivement ce donneur du registre clinique." />

      <ImportDonorsModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};