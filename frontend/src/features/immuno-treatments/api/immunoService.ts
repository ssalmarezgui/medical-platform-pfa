import axios from 'axios';
import { TraitementImmunoSuppresseur, Prescription, DosageMedSang, Medicament } from '../types/immuno';

const API_TIS = 'http://localhost:8081/api/traitements-immuno';
const API_PRESCRIPTION = 'http://localhost:8081/api/prescriptions';
const API_DOSAGE = 'http://localhost:8081/api/dosages-sanguins';
const API_MED = 'http://localhost:8081/api/medicaments';

export const immunoService = {
  getByPatientId: async (patientId?: string): Promise<TraitementImmunoSuppresseur[]> => {
    const { data } = await axios.get<TraitementImmunoSuppresseur[]>(
      patientId && patientId.trim() !== "" ? `${API_TIS}?patientId=${patientId}` : API_TIS
    );
    return data;
  },
  createTIS: async (t: TraitementImmunoSuppresseur): Promise<TraitementImmunoSuppresseur> => {
    const { data } = await axios.post<TraitementImmunoSuppresseur>(API_TIS, t);
    return data;
  },

  getPrescriptions: async (traitementId: number): Promise<Prescription[]> => {
    const { data } = await axios.get<Prescription[]>(`${API_PRESCRIPTION}?traitementId=${traitementId}`);
    return data;
  },
  createPrescription: async (tId: number, medId: number, p: Prescription): Promise<Prescription> => {
    const { data } = await axios.post<Prescription>(`${API_PRESCRIPTION}/traitement/${tId}/medicament/${medId}`, p);
    return data;
  },
  deletePrescription: async (id: number): Promise<void> => {
    await axios.delete(`${API_PRESCRIPTION}/${id}`);
  },

  getDosages: async (traitementId: number): Promise<DosageMedSang[]> => {
    const { data } = await axios.get<DosageMedSang[]>(`${API_DOSAGE}?traitementId=${traitementId}`);
    return data;
  },
  createDosage: async (tId: number, d: DosageMedSang): Promise<DosageMedSang> => {
    const { data } = await axios.post<DosageMedSang>(`${API_DOSAGE}/traitement/${tId}`, d);
    return data;
  },
  deleteDosage: async (id: number): Promise<void> => {
    await axios.delete(`${API_DOSAGE}/${id}`);
  },

  getMedicaments: async (): Promise<Medicament[]> => {
    const { data } = await axios.get<Medicament[]>(API_MED);
    return data;
  }
};