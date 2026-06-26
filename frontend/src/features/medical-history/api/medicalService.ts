import axios from 'axios';
import { AntecedentMedical, CreateAntecedentMedicalDTO } from '../types/medical';

const API_URL = 'http://localhost:8081/api/antecedents-medicaux';

export const medicalService = {
  getByPatientId: async (patientId?: string): Promise<AntecedentMedical[]> => {
    const { data } = await axios.get<AntecedentMedical[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  create: async (patientId: string, am: CreateAntecedentMedicalDTO): Promise<AntecedentMedical> => {
    const { data } = await axios.post<AntecedentMedical>(`${API_URL}/patient/${patientId}`, am);
    return data;
  },

  getByDonorId: async (donorId?: number): Promise<AntecedentMedical[]> => {
    const { data } = await axios.get<AntecedentMedical[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  createForDonor: async (donorId: number, am: CreateAntecedentMedicalDTO): Promise<AntecedentMedical> => {
    const { data } = await axios.post<AntecedentMedical>(`${API_URL}/donneur/${donorId}`, am);
    return data;
  },

  
  update: async (id: number, am: Partial<AntecedentMedical>): Promise<AntecedentMedical> => {
    const { data } = await axios.put<AntecedentMedical>(`${API_URL}/${id}`, am);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};