import axios from 'axios';
import { AntecedentGynecoObstetrique, CreateObgynDTO } from '../types/obgyn';

const API_URL = 'http://localhost:8081/api/antecedents-gyneco';

export const obgynService = {
  getAll: async (): Promise<AntecedentGynecoObstetrique[]> => {
    const { data } = await axios.get<AntecedentGynecoObstetrique[]>(API_URL);
    return data;
  },

  getByPatientId: async (patientId: string): Promise<AntecedentGynecoObstetrique> => {
    const { data } = await axios.get<AntecedentGynecoObstetrique>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  create: async (patientId: string, ago: CreateObgynDTO): Promise<AntecedentGynecoObstetrique> => {
    const { data } = await axios.post<AntecedentGynecoObstetrique>(`${API_URL}/patient/${patientId}`, ago);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<AntecedentGynecoObstetrique> => {
    const { data } = await axios.get<AntecedentGynecoObstetrique>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  createForDonor: async (donorId: number, ago: CreateObgynDTO): Promise<AntecedentGynecoObstetrique> => {
    const { data } = await axios.post<AntecedentGynecoObstetrique>(`${API_URL}/donneur/${donorId}`, ago);
    return data;
  },

  update: async (id: number, ago: Partial<AntecedentGynecoObstetrique>): Promise<AntecedentGynecoObstetrique> => {
    const { data } = await axios.put<AntecedentGynecoObstetrique>(`${API_URL}/${id}`, ago);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};