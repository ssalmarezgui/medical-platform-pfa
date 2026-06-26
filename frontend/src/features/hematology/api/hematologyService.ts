import axios from 'axios';
import { HemotologieHemostase, CreateHematologyDTO } from '../types/hematology';

const API_URL = 'http://localhost:8081/api/hematologie';

export const hematologyService = {
  getAll: async (): Promise<HemotologieHemostase[]> => {
    const { data } = await axios.get<HemotologieHemostase[]>(API_URL);
    return data;
  },

  getByPatientId: async (patientId: string): Promise<HemotologieHemostase> => {
    const { data } = await axios.get<HemotologieHemostase>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  save: async (patientId: string, hh: CreateHematologyDTO): Promise<HemotologieHemostase> => {
    const { data } = await axios.post<HemotologieHemostase>(`${API_URL}/patient/${patientId}`, hh);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<HemotologieHemostase> => {
    const { data } = await axios.get<HemotologieHemostase>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  saveForDonor: async (donorId: number, hh: CreateHematologyDTO): Promise<HemotologieHemostase> => {
    const { data } = await axios.post<HemotologieHemostase>(`${API_URL}/donneur/${donorId}`, hh);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};