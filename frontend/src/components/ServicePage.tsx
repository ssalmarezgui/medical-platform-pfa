import { useState } from 'react';
import { useServices, useDeleteService } from '../features/services/hooks/useServices';
import { useHospitals } from '../features/hospitals/hooks/useHospitals';
import { 
  IconBuildingHospital, 
  IconSearch, 
  IconPlus,
  IconBed,
  IconStethoscope,
  IconDoorEnter,
  IconFileSpreadsheet,
  IconDatabaseImport,
  IconTrash,
  IconEdit,
  IconArrowRight,
  IconHospital
} from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { AddServiceModal } from '../features/services/components/AddServiceModal';
import { EditServiceModal } from '../features/services/components/EditServiceModal';
import { ImportServicesModal } from '../features/services/components/ImportServicesModal';

export const ServicePage = () => {
  const { data: hospitals } = useHospitals();
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('');
  
  const { data: services, isLoading, error } = useServices(selectedHospitalFilter || undefined);
  const deleteServiceMutation = useDeleteService();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (idToDelete === null) return;
    try {
      await deleteServiceMutation.mutateAsync(idToDelete);
      setConfirmOpen(false);
      setToastType('success');
      setToastMessage("Le service a été supprimé avec succès.");
      setToastOpen(true);
    } catch {
      setConfirmOpen(false);
      setToastType('error');
      setToastMessage("Erreur : impossible de supprimer ce service. Des médecins ou patients y sont rattachés.");
      setToastOpen(true);
    }
  };

  const triggerEdit = (service: any) => {
    setSelectedService(service);
    setIsEditOpen(true);
  };

  const handleExportCSV = () => {
    if (!services || services.length === 0) return;
    const headers = ["identifiantS", "libelleS", "nbLitsS", "nbChambresS", "nbMedecinsS", "idHopital"];
    const csvContent = [
      headers.join(";"),
      ...services.map(s => headers.map(h => `"${String(s[h as keyof typeof s] ?? '').replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_services_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };



  const sansAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredServices = services?.filter(service => {
    const nomServicePropre = sansAccents(service.libelleS.toLowerCase());
    const recherchePropre = sansAccents(searchTerm.toLowerCase());
    return nomServicePropre.includes(recherchePropre);
  });

  const estVide = !services || services.length === 0;

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
        Erreur de connexion au backend Spring Boot.
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full flex-1">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services Hospitaliers</h1>
          <p className="text-[#6588BB] text-sm mt-1">Gérer les pôles et spécialités médicales par établissement.</p>
        </div>

        {!estVide && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <select 
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#2B5296] outline-none"
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            >
              <option value="">Tous les hôpitaux</option>
              {hospitals?.map(h => (
                <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
              ))}
            </select>


            <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#006591] focus:ring-1 focus:ring-[#006591] outline-none text-sm text-slate-800 transition-all" 
                placeholder="Rechercher par nom Service" 
                type="text"
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

            <button onClick={handleExportCSV} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">
              <IconFileSpreadsheet size={18} />
            </button>

            <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 flex items-center gap-2 border-none cursor-pointer">
              <IconPlus size={16} /> Ajouter un service
            </button>
          </div>
        )}
      </div>

      {estVide ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-slate-100 rounded-[30px] p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2B5296] mb-6">
            <IconBuildingHospital size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun service</h3>
          <p className="text-[#6588BB] text-xs max-w-xs mb-6">Commencez par ajouter une spécialité médicale rattachée à un établissement.</p>
          <button onClick={() => setIsAddOpen(true)} className="bg-[#2B5296] text-white px-5 py-3 rounded-xl text-xs font-bold border-none cursor-pointer">
            Ajouter le premier service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices?.map((service) => {
            const hasMedecins = (service.nbMedecinsS || 0) > 0;
            const hospitalLabel = hospitals?.find(h => h.identifiantH === service.idHopital)?.libelleH || "Hôpital lié";

            return (
              <div key={service.identifiantS} className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2B5296]">
                      <IconBuildingHospital size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      hasMedecins ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {hasMedecins ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.libelleS}</h3>
                  
                  <p className="text-xs text-[#6588BB] flex items-center gap-1.5 mb-4 font-bold">
                    <IconHospital size={16} />
                    {hospitalLabel}
                  </p>

                  <div className="space-y-2 border-t border-slate-50 pt-4">
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <IconDoorEnter size={16} className="text-slate-400" />
                      <span>{service.nbChambresS || 0} Chambres</span>
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <IconBed size={16} className="text-slate-400" />
                      <span>{service.nbLitsS || 0} Lits d'hospitalisation</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="text-xs font-bold text-[#2B5296] flex items-center gap-1">
                    <IconStethoscope size={16} />
                    {service.nbMedecinsS || 0} Médecins
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => triggerEdit(service)} className="p-2 bg-slate-50 hover:bg-slate-100 text-[#006591] rounded-lg border-none cursor-pointer">
                      <IconEdit size={16} />
                    </button>
                    <button onClick={() => triggerDelete(service.identifiantS!)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-none cursor-pointer">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddServiceModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {selectedService && (
        <EditServiceModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedService(null); }} service={selectedService} />
      )}
      
      <DeleteConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="Supprimer ce service ?" 
        message="Cette action est irréversible. Le service sera définitivement retiré de l'établissement." 
      />

      <ImportServicesModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};