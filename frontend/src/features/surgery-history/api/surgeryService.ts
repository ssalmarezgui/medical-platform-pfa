import axios from 'axios';
import { AntecedentChirurgical, CreateAntecedentChirurgicalDTO } from '../types/surgery';

const API_URL = 'http://localhost:8081/api/antecedents-chirurgicaux';

export const surgeryService = {
  getByPatientId: async (patientId?: string): Promise<AntecedentChirurgical[]> => {
    const { data } = await axios.get<AntecedentChirurgical[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  create: async (patientId: string, ac: CreateAntecedentChirurgicalDTO): Promise<AntecedentChirurgical> => {
    const { data } = await axios.post<AntecedentChirurgical>(`${API_URL}/patient/${patientId}`, ac);
    return data;
  },

  getByDonorId: async (donorId?: number): Promise<AntecedentChirurgical[]> => {
    const { data } = await axios.get<AntecedentChirurgical[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  createForDonor: async (donorId: number, ac: CreateAntecedentChirurgicalDTO): Promise<AntecedentChirurgical> => {
    const { data } = await axios.post<AntecedentChirurgical>(`${API_URL}/donneur/${donorId}`, ac);
    return data;
  },

  update: async (id: number, ac: Partial<AntecedentChirurgical>): Promise<AntecedentChirurgical> => {
    const { data } = await axios.put<AntecedentChirurgical>(`${API_URL}/${id}`, ac);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};