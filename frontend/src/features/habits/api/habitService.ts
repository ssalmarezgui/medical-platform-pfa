import axios from 'axios';
import { Habitude, CreateHabitudeDTO } from '../types/habits';

const API_URL = 'http://localhost:8081/api/habitudes';

export const habitService = {
  getByPatientId: async (patientId: string): Promise<Habitude[]> => {
    const { data } = await axios.get<Habitude[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  getByDonorId: async (donorId: number): Promise<Habitude[]> => {
    const { data } = await axios.get<Habitude[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  create: async (patientId: string, habit: CreateHabitudeDTO): Promise<Habitude> => {
    const { data } = await axios.post<Habitude>(`${API_URL}/patient/${patientId}`, habit);
    return data;
  },

  createForDonor: async (donorId: number, habit: CreateHabitudeDTO): Promise<Habitude> => {
    const { data } = await axios.post<Habitude>(`${API_URL}/donneur/${donorId}`, habit);
    return data;
  },

  update: async (id: number, habit: Partial<Habitude>): Promise<Habitude> => {
    const { data } = await axios.put<Habitude>(`${API_URL}/${id}`, habit);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};