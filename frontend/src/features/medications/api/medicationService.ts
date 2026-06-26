import axios from 'axios';
import { MedicamentLongCours, CreateMedicamentLongCoursDTO } from '../types/medications';

const API_URL = 'http://localhost:8081/api/medicaments-long-cours';

export const medicationService = {
  getByPatientId: async (patientId?: string): Promise<MedicamentLongCours[]> => {
    const { data } = await axios.get<MedicamentLongCours[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  create: async (patientId: string, mlc: CreateMedicamentLongCoursDTO): Promise<MedicamentLongCours> => {
    const { data } = await axios.post<MedicamentLongCours>(`${API_URL}/patient/${patientId}`, mlc);
    return data;
  },

  getByDonorId: async (donorId?: number): Promise<MedicamentLongCours[]> => {
    const { data } = await axios.get<MedicamentLongCours[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  createForDonor: async (donorId: number, mlc: CreateMedicamentLongCoursDTO): Promise<MedicamentLongCours> => {
    const { data } = await axios.post<MedicamentLongCours>(`${API_URL}/donneur/${donorId}`, mlc);
    return data;
  },

  
  update: async (id: number, mlc: Partial<MedicamentLongCours>): Promise<MedicamentLongCours> => {
    const { data } = await axios.put<MedicamentLongCours>(`${API_URL}/${id}`, mlc);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};