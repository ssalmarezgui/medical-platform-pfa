import { useState } from 'react';
import { useDoctors, useDeleteDoctor } from '../features/doctors/hooks/useDoctors';
import { useHospitals } from '../features/hospitals/hooks/useHospitals';
import { 
  IconStethoscope, 
  IconSearch, 
  IconPlus,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconFileSpreadsheet,
  IconDatabaseImport,
  IconTrash,
  IconEdit,
  IconBuildingHospital,
  IconGenderMale,
  IconGenderFemale
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from './ui/DeleteConfirmModal';
import { AddDoctorModal } from '../features/doctors/components/AddDoctorModal';
import { EditDoctorModal } from '../features/doctors/components/EditDoctorModal';
import { ImportDoctorsModal } from '../features/doctors/components/ImportDoctorsModal';

export const DoctorPage = () => {
  const { data: hospitals } = useHospitals();
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('');
  
  const { data: doctors, isLoading, error } = useDoctors(undefined, selectedHospitalFilter || undefined);
  const deleteDoctorMutation = useDeleteDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);


  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const triggerEdit = (doc: any) => {
    setSelectedDoctor(doc);
    setIsEditOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (idToDelete === null) return;
    try {
      await deleteDoctorMutation.mutateAsync(idToDelete);
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Le médecin a été retiré du système avec succès.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur lors de la suppression du médecin.");
      setToastOpen(true);
    }
  };

  const handleExportCSV = () => {
    if (!doctors || doctors.length === 0) {
      alert("Aucune donnée disponible à exporter.");
      return;
    }
    const enTetes = [
      "identifiantM",
      "nomM",
      "prenomM",
      "dateNaissM",
      "sexeM",
      "numTelM",
      "numTelWhapAPPM",
      "adresseDomM",
      "specialiteM",
      "dateDernierDiplomeM",
      "typeMedecin",
      "hospitalName", 
      "serviceName",
      "autreInfo"
    ];

    const lignesCSV = doctors.map(doc => {
      const hospitalName = hospitals?.find(h => h.identifiantH === doc.indexHopitalM)?.libelleH || "Non lié";
      const serviceName = doc.service?.libelleS || "Aucun pôle";

      return enTetes.map(champ => {
        let valeur = "";
        

        if (champ === "hospitalName") {
          valeur = hospitalName;
        } else if (champ === "serviceName") {
          valeur = serviceName;
        } else {
          valeur = doc[champ as keyof typeof doc] ?? "";
        }
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
    lienTelechargement.setAttribute("download", `export_medecins_${dateAujourdhui}.csv`);
    
    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    document.body.removeChild(lienTelechargement);
  };


  const sansAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredDoctors = doctors?.filter(doc => {
    const nomComplet = sansAccents(`${doc.prenomM} ${doc.nomM}`.toLowerCase());
    const recherchePropre = sansAccents(searchTerm.toLowerCase());
    return nomComplet.includes(recherchePropre) || sansAccents(doc.specialiteM.toLowerCase()).includes(recherchePropre);
  });

  const estVide = !doctors || doctors.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5296]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        Erreur de connexion au serveur Spring Boot.
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full flex-1">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Corps Médical</h1>
          <p className="text-[#6588BB] text-sm mt-1">Gérer les médecins praticiens et leurs affectations cliniques.</p>
        </div>

        {!estVide && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <select 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#2B5296] outline-none"
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            >
              <option value="">Tous les établissements</option>
              {hospitals?.map(h => (
                <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
                placeholder="Rechercher par nom ou spécialité..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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

            <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 flex items-center gap-2 border-none cursor-pointer">
              <IconPlus size={16} /> Ajouter un médecin
            </button>
          </div>
        )}
      </div>

      {estVide ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-slate-100 rounded-[30px] p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2B5296] mb-6">
            <IconStethoscope size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun médecin</h3>
          <p className="text-[#6588BB] text-xs max-w-xs mb-6">Ajoutez les médecins praticiens de votre établissement.</p>
          <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
            Enregistrer le premier médecin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors?.map((doc) => {
            const isMale = doc.sexeM === 'M';
            const hospitalName = hospitals?.find(h => h.identifiantH === doc.indexHopitalM)?.libelleH || "Hôpital lié";

            return (
              <div key={doc.identifiantM} className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        isMale ? 'bg-blue-50 text-[#2B5296]' : 'bg-pink-50 text-pink-500'
                      }`}>
                        <IconStethoscope size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          Dr. {doc.prenomM} {doc.nomM}
                        </h3>
                        <p className="text-[11px] text-[#6588BB] font-black uppercase tracking-wider mt-0.5">
                          {doc.specialiteM}
                        </p>
                        
                        <p className="text-[10px] text-[#2B5296] font-mono font-bold mt-1">
                          Matricule : #{doc.identifiantM}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-50 text-slate-500 border-slate-100">
                      {doc.typeMedecin?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-50 pt-4">
                    
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <IconBuildingHospital size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">{hospitalName}</span>
                        {doc.service && doc.service.libelleS ? (
                          <p className="text-[10px] text-[#006591] font-bold mt-0.5">
                            Service : {doc.service.libelleS}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            Aucun service rattaché
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <IconPhone size={16} className="text-slate-400" />
                      <span>{doc.numTelM}</span>
                    </p>

                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <IconMapPin size={16} className="text-slate-400" />
                      <span className="truncate">{doc.adresseDomM}</span>
                    </p>

                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <IconCalendar size={16} className="text-slate-400" />
                      <span>Né(e) le : <span className="font-semibold text-slate-700">{doc.dateNaissM}</span></span>
                    </p>

                    {doc.autreInfo && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-50/50 mt-1">
                        "{doc.autreInfo}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <IconCalendar size={14} />
                    Diplômé le : {doc.dateDernierDiplomeM}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => triggerEdit(doc)} className="p-2 bg-slate-50 hover:bg-slate-100 text-[#006591] rounded-lg border-none cursor-pointer">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => triggerDelete(doc.identifiantM!)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-none cursor-pointer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddDoctorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {selectedDoctor && (
        <EditDoctorModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedDoctor(null); }} doctor={selectedDoctor} />
      )}
      
      <DeleteConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="Retirer ce médecin ?" 
        message="Cette action est irréversible. Le médecin sera désinscrit du service ainsi que de tous ses patients suivis." 
      />

      <ImportDoctorsModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};