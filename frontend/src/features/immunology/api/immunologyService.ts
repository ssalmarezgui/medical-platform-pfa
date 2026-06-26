import axios from 'axios';
import { BilanImmunologique, CreateBilanImmunologiqueDTO } from '../types/immunology';

const API_URL = 'http://localhost:8081/api/immunologie';

export const immunologyService = {
  getAll: async (): Promise<BilanImmunologique[]> => {
    const { data } = await axios.get<BilanImmunologique[]>(API_URL);
    return data;
  },

  getByPatientId: async (patientId: string): Promise<BilanImmunologique> => {
    const { data } = await axios.get<BilanImmunologique>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  save: async (patientId: string, bi: CreateBilanImmunologiqueDTO): Promise<BilanImmunologique> => {
    const { data } = await axios.post<BilanImmunologique>(`${API_URL}/patient/${patientId}`, bi);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<BilanImmunologique> => {
    const { data } = await axios.get<BilanImmunologique>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  saveForDonor: async (donorId: number, bi: CreateBilanImmunologiqueDTO): Promise<BilanImmunologique> => {
    const { data } = await axios.post<BilanImmunologique>(`${API_URL}/donneur/${donorId}`, bi);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};