import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePatient, usePatients } from '../hooks/usePatients';
import { useHospitals } from '../../hospitals/hooks/useHospitals';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { useAuthStore } from '../../../store/useAuthStore';
import { patientSchema, PatientFormValues } from '../types/patients';
import { IconX, IconLoader, IconAlertCircle } from '@tabler/icons-react';
import { Toast } from '../../../components/ui/Toast';

interface AddPatientProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPatientModal = ({ isOpen, onClose }: AddPatientProps) => {
  const createPatientMutation = useCreatePatient();
  const { data: hospitals } = useHospitals();
  const { data: doctors } = useDoctors();
  const { data: existingPatients } = usePatients(); 
  const { user } = useAuthStore();
  
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [selectedHospital, setSelectedHospital] = useState('');
  const [duplicatePatient, setDuplicatePatient] = useState<any | null>(null);

  const isInvestigateur = user?.roleU === 'MEDECIN_INVESTIGATEUR';

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PatientFormValues & { medecinSuiviId?: any }>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      nomP: '', 
      prenomP: '', 
      sexeP: 'M', 
      dateNaissP: '', 
      nationaliteP: 'Tunisienne',
      origineGeogP: '', 
      adresseP: '', 
      telephoneP: '', 
      adressEmailP: '',
      telephoneWhatsAppP: '', 
      personneAcontacterP: '', 
      typeCarnetP: '' as any,
      numCarnetP: '', 
      adulteP: true, 
      statut: 'ACTIF', 
      evolution: 'STABLE',
      niveauEducation: '', 
      enEtatActivite: true, 
      medecinInvestigateurId: undefined,
      medecinSuiviId: undefined,
      numeroCin: '' as any,
      indexHopitalP: ''
    }
  });

  const watchedHospital = watch('indexHopitalP');
  useEffect(() => { setSelectedHospital(watchedHospital || ''); }, [watchedHospital]);

  useEffect(() => {
    if (isOpen && isInvestigateur && doctors && user) {
      const matchedDoctor = doctors.find(doc => doc.typeMedecin === 'INVESTIGATEUR');
      if (matchedDoctor) {
        setValue('medecinInvestigateurId', matchedDoctor.identifiantM);
        setValue('indexHopitalP', matchedDoctor.indexHopitalM);
        setSelectedHospital(matchedDoctor.indexHopitalM);
      }
    }
  }, [isOpen, isInvestigateur, doctors, user, setValue]);

  const investigators = doctors?.filter(doc => 
    doc.typeMedecin === 'INVESTIGATEUR' && 
    (selectedHospital === '' || doc.indexHopitalM === selectedHospital)
  );

  const suiviDoctors = doctors?.filter(doc => 
    doc.typeMedecin === 'SUIVI' && 
    (selectedHospital === '' || doc.indexHopitalM === selectedHospital)
  );

  const watchedAdulte = watch('adulteP');
  const isAdulteSelected = watchedAdulte === true || String(watchedAdulte) === 'true';

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

  const handleCloseWithReset = () => {
    reset(); 
    setSelectedHospital('');
    setDuplicatePatient(null);
    onClose(); 
  };

  const onSubmit = async (data: PatientFormValues & { medecinSuiviId?: any }) => {
    const rawSuiviId = watch('medecinSuiviId');
    const isPatientAdulte = typeof data.adulteP === 'string' ? data.adulteP === 'true' : !!data.adulteP;

    const checkCin = String(data.numeroCin).trim();
    const checkDate = data.dateNaissP;
    const checkNom = data.nomP.trim().toLowerCase();
    const checkPrenom = data.prenomP.trim().toLowerCase();

    let doublon: any = null;

    if (isPatientAdulte) {
      doublon = existingPatients?.find(p => 
        (p.adulteP === true && p.numeroCin === checkCin && p.dateNaissP === checkDate)
      );
    } else {
      doublon = existingPatients?.find(p => 
        p.adulteP === false &&
        p.numeroCin === checkCin && 
        p.dateNaissP === checkDate &&
        p.nomP.trim().toLowerCase() === checkNom &&
        p.prenomP.trim().toLowerCase() === checkPrenom
      );
    }

    if (doublon) {
      setDuplicatePatient(doublon);
      return; 
    }

    const codeHopital = selectedHospital ? selectedHospital.substring(0, 3).toUpperCase() : "HOS";
    const partCIN = checkCin.slice(-4);
    const partCarnet = data.numCarnetP.slice(-4);
    const suffixe = isPatientAdulte ? "A" : "E"; 
    
    const sequence = (existingPatients?.filter(p => p.indexHopitalP === selectedHospital).length || 0) + 1;
    const sequenceStr = String(sequence).padStart(3, '0');

    const generatedPatientId = `${codeHopital}_${partCIN}_${partCarnet}_${suffixe}_${sequenceStr}`;

    try {
      const formattedData = {
        ...data,
        identifiantP: generatedPatientId, 
        adulteP: isPatientAdulte,
        enEtatActivite: typeof data.enEtatActivite === 'string' ? data.enEtatActivite === 'true' : !!data.enEtatActivite,
        medecinInvestigateur: data.medecinInvestigateurId ? { identifiantM: Number(data.medecinInvestigateurId) } : null,
        medecinsSuivi: rawSuiviId ? [{ identifiantM: Number(rawSuiviId) }] : [],
        affectations: [],
      };

      await createPatientMutation.mutateAsync(formattedData as any);
      setToastType('success');
      setToastMessage("Patient admis avec succès !");
      setToastOpen(true);
      reset();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      console.error("Détail de l'erreur :", error.response?.data);
      const errorMessage = error.response?.data?.message || "";
      
      if (errorMessage.startsWith("DOUBLON_DETECTED:")) {
        const idDoublon = errorMessage.split(":")[1];
        const patientTrouve = existingPatients?.find(p => p.identifiantP === idDoublon);
        if (patientTrouve) {
          setDuplicatePatient(patientTrouve);
          return;
        }
      }

      setToastType('error');
      setToastMessage(errorMessage || "Erreur lors de l'enregistrement.");
      setToastOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#2B5296]">Nouvelle Admission Patient</h2>
            <button type="button" onClick={handleCloseWithReset} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><IconX size={20}/></button>
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
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nom *</label>
                <input {...register('nomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Prénom *</label>
                <input {...register('prenomP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Sexe *</label>
                <select {...register('sexeP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Date Naissance *</label>
                <input type="date" {...register('dateNaissP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Nationalité *</label>
                <input {...register('nationaliteP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Origine Géo *</label>
                <input {...register('origineGeogP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
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
              <div className="col-span-1">
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse *</label>
                <input {...register('adresseP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Téléphone *</label>
                <input placeholder="Ex: 98765432" {...register('telephoneP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">WhatsApp *</label>
                <input placeholder="" {...register('telephoneWhatsAppP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Adresse Email *</label>
                <input type="email" placeholder="exemple@domaine.com" {...register('adressEmailP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Niveau d'éducation *</label>
                <input placeholder="Ex: Universitaire, Secondaire" {...register('niveauEducation')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Contact Urgence *</label>
                <input {...register('personneAcontacterP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Type Carnet *</label>
                <select {...register('typeCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
                  <option value="">Choisir...</option>
                  <option value="CNAM">CNAM</option>
                  <option value="CNSS">CNSS</option>
                  <option value="CNRPS">CNRPS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Numéro Carnet *</label>
                <input {...register('numCarnetP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Statut Dossier *</label>
                <input placeholder="" {...register('statut')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Évolution clinique *</label>
                <input placeholder="" {...register('evolution')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            </div>

            {!isInvestigateur ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Hôpital *</label>
                  <select {...register('indexHopitalP')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296] outline-none">
                    <option value="">Sélectionner...</option>
                    {hospitals?.map(h => <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Médecin Investigateur *</label>
                  <select {...register('medecinInvestigateurId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296] outline-none">
                    <option value="">Associer...</option>
                    {investigators?.map(doc => <option key={doc.identifiantM} value={doc.identifiantM}>Dr. {doc.prenomM} {doc.nomM}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6588BB] uppercase mb-1.5">Médecin de Suivi</label>
                  <select {...register('medecinSuiviId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296] outline-none">
                    <option value="">Sélectionner un médecin de suivi...</option>
                    {suiviDoctors?.map(doc => <option key={doc.identifiantM} value={doc.identifiantM}>Dr. {doc.prenomM} {doc.nomM}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#2B5296] uppercase tracking-wider">Affectation hôpital</span>
                  <span className="text-[10px] font-bold text-slate-600">
                    {hospitals?.find(h => h.identifiantH === selectedHospital)?.libelleH || selectedHospital}
                  </span>
                </div>
                {/* L'investigateur connecté peut directement assigner le médecin de suivi de son hôpital lors de l'admission */}
                <div>
                  <select {...register('medecinSuiviId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-bold text-[#2B5296] outline-none">
                    <option value="">Associer un médecin de suivi...</option>
                    {suiviDoctors?.map(doc => <option key={doc.identifiantM} value={doc.identifiantM}>Dr. {doc.prenomM} {doc.nomM}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <button type="button" onClick={handleCloseWithReset} className="px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold border-none bg-transparent cursor-pointer">Annuler</button>
              <button 
                type="submit"
                disabled={createPatientMutation.isPending}
                className="bg-[#2B5296] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-lg shadow-[#2B5296]/20 border-none cursor-pointer disabled:opacity-50"
              >
                {createPatientMutation.isPending ? (
                  <>
                    <IconLoader className="animate-spin" size={16} /> Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {duplicatePatient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border border-red-200 shadow-2xl w-full max-w-md p-8 mx-4 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="text-center text-red-500">
              <IconAlertCircle size={40} className="mx-auto mb-2" />
              <h3 className="text-base font-bold text-red-600">Alerte Identito-Vigilance : Patient Déjà Existant</h3>
            </div>
            <p className="text-slate-500 font-semibold text-center leading-relaxed">
              Un patient correspondant exactement à ces critères d'identification clinique existe déjà dans le système.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-slate-700">
              <p>• <strong>Nom complet</strong> : {duplicatePatient.prenomP.toUpperCase()} {duplicatePatient.nomP.toUpperCase()}</p>
              <p>• <strong>Identifiant Unique</strong> : <span className="font-mono bg-blue-50 text-[#2B5296] px-1.5 py-0.5 rounded font-bold">{duplicatePatient.identifiantP}</span></p>
              <p>• <strong>Né(e) le</strong> : {duplicatePatient.dateNaissP}</p>
              <p>• <strong>CIN enregistré</strong> : {duplicatePatient.numeroCin}</p>
              <p>• <strong>Carnet</strong> : {duplicatePatient.typeCarnetP} ({duplicatePatient.numCarnetP})</p>
              <p>• <strong>Hôpital d'origine</strong> : {hospitals?.find(h => h.identifiantH === duplicatePatient.indexHopitalP)?.libelleH || duplicatePatient.indexHopitalP}</p>
              <p>• <strong>Statut clinique actuel</strong> : {duplicatePatient.statut}</p>
            </div>

            <button 
              type="button" 
              onClick={() => setDuplicatePatient(null)} 
              className="w-full bg-[#2B5296] text-white py-3 rounded-xl font-bold border-none cursor-pointer hover:bg-blue-900 transition-colors mt-2"
            >
              Fermer et Corriger les Informations
            </button>
          </div>
        </div>
      )}

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </>
  );
};