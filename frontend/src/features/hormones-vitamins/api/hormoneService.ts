import axios from 'axios';
import { HormonesVitamines, CreateHormonesVitaminesDTO } from '../types/hormones';

const API_URL = 'http://localhost:8081/api/hormones-vitamines';

export const hormoneService = {
  getAll: async (): Promise<HormonesVitamines[]> => {
    const { data } = await axios.get<HormonesVitamines[]>(API_URL);
    return data;
  },

  getByPatientId: async (patientId: string): Promise<HormonesVitamines> => {
    const { data } = await axios.get<HormonesVitamines>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  save: async (patientId: string, hv: CreateHormonesVitaminesDTO): Promise<HormonesVitamines> => {
    const { data } = await axios.post<HormonesVitamines>(`${API_URL}/patient/${patientId}`, hv);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<HormonesVitamines> => {
    const { data } = await axios.get<HormonesVitamines>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  saveForDonor: async (donorId: number, hv: CreateHormonesVitaminesDTO): Promise<HormonesVitamines> => {
    const { data } = await axios.post<HormonesVitamines>(`${API_URL}/donneur/${donorId}`, hv);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};