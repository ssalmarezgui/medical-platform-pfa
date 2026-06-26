import axios from 'axios';
import { AntecedentFamilial, CreateAntecedentFamilialDTO } from '../types/familyHistory';

const API_URL = 'http://localhost:8081/api/antecedents-familiaux';

export const familyHistoryService = {
  getByPatientId: async (patientId?: string): Promise<AntecedentFamilial[]> => {
    const { data } = await axios.get<AntecedentFamilial[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  getByDonorId: async (donorId?: number): Promise<AntecedentFamilial[]> => {
    const { data } = await axios.get<AntecedentFamilial[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  create: async (patientId: string, af: CreateAntecedentFamilialDTO): Promise<AntecedentFamilial> => {
    const { data } = await axios.post<AntecedentFamilial>(`${API_URL}/patient/${patientId}`, af);
    return data;
  },

  createForDonor: async (donorId: number, af: CreateAntecedentFamilialDTO): Promise<AntecedentFamilial> => {
    const { data } = await axios.post<AntecedentFamilial>(`${API_URL}/donneur/${donorId}`, af);
    return data;
  },

  update: async (id: number, af: Partial<AntecedentFamilial>): Promise<AntecedentFamilial> => {
    const { data } = await axios.put<AntecedentFamilial>(`${API_URL}/${id}`, af);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};