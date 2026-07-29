import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePatient } from '../hooks/usePatients';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { patientSchema, PatientFormValues } from '../types/patients';
import { IconX, IconLoader, IconAlertCircle } from '@tabler/icons-react';
import { Patient } from '../types/patients';
import { Toast } from '../../../components/ui/Toast';

interface EditPatientProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const EditPatientModal = ({ isOpen, onClose, patient }: EditPatientProps) => {
  const updatePatientMutation = useUpdatePatient();
  const { data: hospitals } = useHospitals();
  const { data: doctors } = useDoctors();
  
  const investigators = doctors?.filter(doc => doc.typeMedecin === 'INVESTIGATEUR');
  const suiviDoctors = doctors?.filter(doc => doc.typeMedecin === 'SUIVI');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PatientFormValues & { medecinSuiviId?: any }>({
    resolver: zodResolver(patientSchema) as any,
  });

  const watchedAdulte = watch('adulteP');
  
  const isAdulteSelected = watchedAdulte !== undefined 
    ? (watchedAdulte === true || String(watchedAdulte) === 'true')
    : (patient?.adulteP === true);

  const watchedDateNaiss = watch('dateNaissP');
  useEffect(() => {
    if (watchedDateNaiss) {
      const birthDate = new Date(watchedDateNaiss);
      const today = new Date();
      
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      if (calculatedAge < 18 && calculatedAge >= 0) {
        setValue('adulteP', false);
      } else {
        setValue('adulteP', true);
      }
    }
  }, [watchedDateNaiss, setValue]);

  useEffect(() => {
    if (patient && doctors) {
      const initialInvestigatorIdStr = patient.medecinInvestigateurId ? String(patient.medecinInvestigateurId) : '';
      const initialSuiviIdStr = patient.medecinSuiviId ? String(patient.medecinSuiviId) : '';

      reset({
        nomP: patient.nomP,
        prenomP: patient.prenomP,
        indexHopitalP: patient.indexHopitalP,
        numeroCin: patient.numeroCin ? String(patient.numeroCin) : '' as any,
        dateNaissP: patient.dateNaissP,
        sexeP: patient.sexeP,
        nationaliteP: patient.nationaliteP,
        origineGeogP: patient.origineGeogP,
        adresseP: patient.adresseP,
        telephoneP: patient.telephoneP,
        adressEmailP: patient.adressEmailP,
        telephoneWhatsAppP: patient.telephoneWhatsAppP,
        personneAcontacterP: patient.personneAcontacterP,
        typeCarnetP: patient.typeCarnetP,
        numCarnetP: patient.numCarnetP,
        adulteP: patient.adulteP,
        statut: patient.statut,
        evolution: patient.evolution,
        niveauEducation: patient.niveauEducation,
        enEtatActivite: patient.enEtatActivite,
        medecinInvestigateurId: initialInvestigatorIdStr,
        medecinSuiviId: initialSuiviIdStr
      });
    }
  }, [patient, doctors, reset]);

  const handleCloseAndCancel = () => {
    if (patient) {
      const initialInvestigatorIdStr = patient.medecinInvestigateurId ? String(patient.medecinInvestigateurId) : '';
      const initialSuiviIdStr = patient.medecinSuiviId ? String(patient.medecinSuiviId) : '';

      reset({
        nomP: patient.nomP,
        prenomP: patient.prenomP,
        indexHopitalP: patient.indexHopitalP,
        numeroCin: patient.numeroCin ? String(patient.numeroCin) : '' as any,
        dateNaissP: patient.dateNaissP,
        sexeP: patient.sexeP,
        nationaliteP: patient.nationaliteP,
        origineGeogP: patient.origineGeogP,
        adresseP: patient.adresseP,
        telephoneP: patient.telephoneP,
        adressEmailP: patient.adressEmailP,
        telephoneWhatsAppP: patient.telephoneWhatsAppP,
        personneAcontacterP: patient.personneAcontacterP,
        typeCarnetP: patient.typeCarnetP,
        numCarnetP: patient.numCarnetP,
        adulteP: patient.adulteP,
        statut: patient.statut,
        evolution: patient.evolution,
        niveauEducation: patient.niveauEducation,
        enEtatActivite: patient.enEtatActivite,
        medecinInvestigateurId: initialInvestigatorIdStr,
        medecinSuiviId: initialSuiviIdStr
      });
    }
    onClose();
  };

  const onSubmit = async (data: PatientFormValues & { medecinSuiviId?: any }) => {
    if (!patient || patient.identifiantP === undefined) return;

    const rawSuiviId = watch('medecinSuiviId');

    const finalCin = data.numeroCin; 

    try {
      const formattedData = {
        ...data,
        numeroCin: finalCin, 
        adulteP: isAdulteSelected,
        enEtatActivite: typeof data.enEtatActivite === 'string' ? data.enEtatActivite === 'true' : !!data.enEtatActivite,
        medecinInvestigateur: data.medecinInvestigateurId 
          ? { identifiantM: Number(data.medecinInvestigateurId) } 
          : null,
        medecinSuiviId: (rawSuiviId && rawSuiviId !== "") ? Number(rawSuiviId) : null,
      };

      await updatePatientMutation.mutateAsync({
        id: patient.identifiantP as any,
        data: formattedData as any,
      });

      setToastType('success');
      setToastMessage("Le dossier du patient a été mis à jour avec succès !");
      setToastOpen(true);

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.response?.data?.message || "Erreur lors de la mise à jour du dossier d'admission.");
      setToastOpen(true);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296]">Modifier le Dossier d'Admission</h2>
            <button type="button" onClick={handleCloseAndCancel} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-100 text-red-700 text-xs rounded-xl">
                <strong>Erreurs de formulaire :</strong>
                <ul className="list-disc ml-4 mt-1">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{key}: {(error as any).message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom du Patient *</label>
                <input {...register('nomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Genre (Sexe) *</label>
                <select {...register('sexeP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-semibold">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date Naissance *</label>
                <input type="date" {...register('dateNaissP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">
                  {isAdulteSelected ? "Numéro CIN *" : "CIN du Parent *"}
                </label>
                <input 
                  type="text" 
                  maxLength={8} 
                  placeholder={isAdulteSelected ? "" : "CIN du tuteur legal"} 
                  {...register('numeroCin')} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nationalité *</label>
                <input {...register('nationaliteP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Origine Géographique *</label>
                <input {...register('origineGeogP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Patient *</label>
                <select 
                  {...register('adulteP', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold outline-none"
                >
                  <option value="true">Adulte</option>
                  <option value="false">Pédiatrique</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">En activité *</label>
                <select 
                  {...register('enEtatActivite', { setValueAs: (v) => v === 'true' })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold outline-none"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse de domicile *</label>
                <input {...register('adresseP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone *</label>
                <input placeholder="Ex: 98765432" {...register('telephoneP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">WhatsApp *</label>
                <input placeholder="" {...register('telephoneWhatsAppP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Email de contact *</label>
                <input type="email" placeholder="patient@mail.com" {...register('adressEmailP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Niveau d'Éducation *</label>
                <input {...register('niveauEducation')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Primaire, Universitaire..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Contact d'urgence *</label>
                <input {...register('personneAcontacterP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Nom, Téléphone..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type de carnet *</label>
                <select {...register('typeCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white">
                  <option value="">Choisir...</option>
                  <option value="CNAM">CNAM</option>
                  <option value="CNSS">CNSS</option>
                  <option value="CNRPS">CNRPS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro de carnet *</label>
                <input {...register('numCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Statut Clinique *</label>
                <input placeholder="Ex: ACTIF, DECEDE, TRANSPLANTE" {...register('statut')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-[#2B5296]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Évolution clinique *</label>
                <input {...register('evolution')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" placeholder="Stabilité, dégradation..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Hôpital d'Admission *</label>
                <select {...register('indexHopitalP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Sélectionner...</option>
                  {hospitals?.map(h => (
                    <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Médecin Investigateur *</label>
                <select {...register('medecinInvestigateurId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Associer...</option>
                  {investigators?.map(doc => (
                    <option key={doc.identifiantM} value={String(doc.identifiantM)}>Dr. {doc.prenomM} {doc.nomM}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Médecin de Suivi</label>
                <select {...register('medecinSuiviId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white font-bold text-[#2B5296]">
                  <option value="">Sélectionner...</option>
                  {suiviDoctors?.map(doc => (
                    <option key={doc.identifiantM} value={String(doc.identifiantM)}>Dr. {doc.prenomM} {doc.nomM}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button type="button" onClick={handleCloseAndCancel} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button 
                type="submit" 
                disabled={updatePatientMutation.isPending} 
                className="bg-[#006591] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#004c6e] flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
              >
                {updatePatientMutation.isPending ? (
                  <>
                    <IconLoader className="animate-spin" size={16} /> Enregistrement...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};