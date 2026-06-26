import axios from 'axios';
import { MarqueursTumoraux, CreateMarqueursTumorauxDTO } from '../types/markers';

const API_URL = 'http://localhost:8081/api/marqueurs-tumoraux';

export const markerService = {
  getAll: async (): Promise<MarqueursTumoraux[]> => {
    const { data } = await axios.get<MarqueursTumoraux[]>(API_URL);
    return data;
  },

  getByPatientId: async (patientId: string): Promise<MarqueursTumoraux | null> => {
    const { data } = await axios.get<MarqueursTumoraux[]>(`${API_URL}/patient/${patientId}`);
    return data && data.length > 0 ? data[0] : null;
  },

  save: async (patientId: string, mt: CreateMarqueursTumorauxDTO): Promise<MarqueursTumoraux> => {
    const { data } = await axios.post<MarqueursTumoraux>(`${API_URL}/patient/${patientId}`, mt);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<MarqueursTumoraux | null> => {
    const { data } = await axios.get<MarqueursTumoraux[]>(`${API_URL}/donneur/${donorId}`);
    return data && data.length > 0 ? data[0] : null;
  },

  saveForDonor: async (donorId: number, mt: CreateMarqueursTumorauxDTO): Promise<MarqueursTumoraux> => {
    const { data } = await axios.post<MarqueursTumoraux>(`${API_URL}/donneur/${donorId}`, mt);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};