import axios from 'axios';
import { TransplantationAnterieure, CreateTransplantationAnterieureDTO } from '../types/transplants';

const API_URL = 'http://localhost:8081/api/transplantations-anterieures';

export const transplantService = {
  getByPatientId: async (patientId?: string): Promise<TransplantationAnterieure[]> => {
    const { data } = await axios.get<TransplantationAnterieure[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  create: async (patientId: string, ta: CreateTransplantationAnterieureDTO): Promise<TransplantationAnterieure> => {
    const { data } = await axios.post<TransplantationAnterieure>(`${API_URL}/patient/${patientId}`, ta);
    return data;
  },

  update: async (id: number, ta: Partial<TransplantationAnterieure>): Promise<TransplantationAnterieure> => {
    const { data } = await axios.put<TransplantationAnterieure>(`${API_URL}/${id}`, ta);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};