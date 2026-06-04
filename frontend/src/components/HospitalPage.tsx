import { useState } from 'react';
import { useHospitals, useDeleteHospital } from '../features/hospitals/hooks/useHospitals';
import { AddHospitalModal } from '../features/hospitals/components/AddHospitalModal';
import { Toast } from '../components/ui/Toast';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { EditHospitalModal } from '../features/hospitals/components/EditHospitalModal';
import { ImportHospitalsModal } from '../features/hospitals/components/ImportHospitalsModal';

import { 
  IconHospital, 
  IconMapPin, 
  IconSearch, 
  IconPlus,
  IconBuildingHospital,
  IconBed,
  IconLayoutGrid,
  IconCalendar,
  IconFileSpreadsheet,
  IconDatabaseImport,
  IconTrash,
  IconEdit,
  IconId,
  IconDatabaseOff
} from '@tabler/icons-react';
import { HopitalStructureSoin } from '../features/hospitals/types/hospitals';


const DescriptionExtensible = ({ texte }: { texte: string }) => {
  const [estEtendu, setEstEtendu] = useState(false);

  if (texte.length <= 120) {
    return <p className="text-xs text-slate-500 italic leading-relaxed">{texte}</p>;
  }

  return (
    <div className="space-y-1">
      <p className={`text-xs text-slate-500 italic leading-relaxed transition-all duration-300 ${
        estEtendu ? '' : 'line-clamp-2'
      }`}>
        {texte}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEstEtendu(!estEtendu);
        }}
        className="text-[10px] font-bold text-[#006591] hover:underline cursor-pointer border-none bg-transparent p-0 block"
      >
        {estEtendu ? 'Voir moins' : 'Voir plus'}
      </button>
    </div>
  );
};

export const HospitalPage = () => {
  const { data: hospitals, isLoading, error } = useHospitals();
  const deleteHospitalMutation = useDeleteHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HopitalStructureSoin | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [isImportOpen, setIsImportOpen] = useState(false);


  const triggerDeleteConfirmation = (id: string) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

    const triggerEditModal = (hospital: HopitalStructureSoin) => {
    setSelectedHospital(hospital);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteHospitalMutation.mutateAsync(idToDelete);
      
      setConfirmOpen(false);
      setIdToDelete(null);

      setToastType('success');
      setToastMessage("L'établissement a été supprimé avec succès.");
      setToastOpen(true);
      
    } catch (err) {
      setConfirmOpen(false);
      setIdToDelete(null);

      setToastType('error');
      setToastMessage("Impossible de supprimer. Cet établissement est lié à des services actifs.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = () => {
    if (!hospitals || hospitals.length === 0) {
      alert("Aucune donnée disponible à exporter.");
      return;
    }

    const enTetes = [
      "identifiantH",
      "libelleH",
      "adresseH",
      "nbBlocH",
      "nbServiceH",
      "nbLitsH",
      "descriptionH",
      "dateCreationH"
    ];

    const lignesCSV = hospitals.map(hospital => {
      return enTetes.map(champ => {
        const valeur = hospital[champ as keyof typeof hospital] ?? "";
        
        const valeurPropre = String(valeur)
          .replace(/"/g, '""')
          .replace(/\r?\n|\r/g, " ");

        return `"${valeurPropre}"`;
      }).join(";");
    });

    const contenuCSV = [enTetes.join(";"), ...lignesCSV].join("\n");
    const signatureUTF8 = "\ufeff";
    const blob = new Blob([signatureUTF8 + contenuCSV], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const lienTelechargement = document.createElement("a");
    lienTelechargement.setAttribute("href", url);
    
    const dateAujourdhui = new Date().toISOString().split('T')[0];
    lienTelechargement.setAttribute("download", `export_hopitaux_${dateAujourdhui}.csv`);
    
    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    document.body.removeChild(lienTelechargement);
  };

  const filteredHospitals = hospitals?.filter(hospital => 
    hospital.libelleH.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006591]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        Une erreur est survenue lors de la récupération des données. Veuillez vérifier votre backend Spring Boot.
      </div>
    );
  }

  const estVide = !hospitals || hospitals.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto w-full flex-1">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Répertoire des Hôpitaux</h1>
          <p className="text-[#6588BB] text-sm mt-1">Gérer les structures de soins affiliées à la plateforme.</p>
        </div>

        {!estVide && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
                placeholder="Rechercher par nom Hôpital" 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsImportOpen(true)}
                title="Importer des données"
                className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
              >
                <IconDatabaseImport size={18} />
              </button>
              <button 
                onClick={handleExportCSV}
                title="Exporter en Excel/CSV"
                className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
              >
                <IconFileSpreadsheet size={18} />
              </button>
            </div>

            <button 
              className="w-full sm:w-auto bg-[#006591] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center justify-center gap-2 shadow-sm border-none cursor-pointer whitespace-nowrap"
              onClick={() => setIsAddModalOpen(true)}
            >
              <IconPlus size={16} /> Ajouter un hôpital
            </button>
          </div>
        )}
      </div>

      {estVide ? (
        <div className="flex flex-col items-center justify-center min-h-[450px] bg-white border border-[#A7C0E4]/30 rounded-[30px] p-12 text-center shadow-sm">
          <div className="h-20 w-20 rounded-[24px] bg-blue-50 flex items-center justify-center text-[#006591] mb-6">
            <IconDatabaseOff size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun hôpital disponible</h3>
          <p className="text-[#6588BB] text-sm max-w-sm mb-8 leading-relaxed">
            Il semble qu'aucune structure de soins ne soit enregistrée pour le moment. Commencez par en ajouter une.
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#006591] text-white px-6 py-3.5 rounded-xl text-xs font-bold hover:bg-[#004c6e] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#006591]/20 border-none cursor-pointer">
            <IconPlus size={16} /> Enregistrer le premier hôpital
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals && filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => {
              const aDesServices = hospital.nbServiceH > 0;

              return (
                <div 
                  key={hospital.identifiantH} 
                  className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#006591]">
                        <IconHospital size={24} />
                      </div>

                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        aDesServices 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {aDesServices ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{hospital.libelleH}</h3>
                      <p className="text-[11px] text-[#6588BB] font-mono flex items-center gap-1.5 font-bold">
                        <IconId size={14} />
                        Code : {hospital.identifiantH}
                      </p>
                    </div>

                    <div className="mb-4">
                      <DescriptionExtensible 
                        texte={hospital.descriptionH || "Aucune description fournie pour cet établissement."} 
                      />
                    </div>

                    <div className="space-y-2 border-t border-slate-50 pt-4">
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <IconMapPin size={16} className="text-slate-400 shrink-0" />
                        <span>{hospital.adresseH || "Adresse non renseignée"}</span>
                      </p>
                      
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <IconLayoutGrid size={16} className="text-slate-400 shrink-0" />
                        <span>{hospital.nbBlocH || 0} Blocs opératoires</span>
                      </p>

                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <IconBed size={16} className="text-slate-400 shrink-0" />
                        <span>{hospital.nbLitsH || 0} Lits d'hospitalisation</span>
                      </p>

                      <p className="text-[11px] text-slate-400 flex items-center gap-2 pt-2">
                        <IconCalendar size={14} />
                        <span>Créé le : {hospital.dateCreationH}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <IconBuildingHospital size={16} className="text-[#006591]" />
                      {hospital.nbServiceH || 0} Services
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => triggerEditModal(hospital)}
                        title="Modifier cet établissement"
                        className="p-2 bg-slate-50 hover:bg-[#DCE6F5]/50 text-[#006591] rounded-lg transition-colors border-none cursor-pointer"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button 
                        onClick={() => triggerDeleteConfirmation(hospital.identifiantH)}
                        title="Supprimer cet établissement"
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border-none cursor-pointer"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white border border-slate-100 rounded-[20px] p-12 text-center text-slate-500">
              Aucune structure de soins ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
      <AddHospitalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <DeleteConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer cet établissement ?"
        message="Cette action est irréversible. L'établissement sera retiré du système ainsi que toutes ses affectations."
      />

      <EditHospitalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHospital(null);
        }}
        hospital={selectedHospital}
      />

      <ImportHospitalsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <Toast 
        isOpen={toastOpen} 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
      />

    </div>
  );
};