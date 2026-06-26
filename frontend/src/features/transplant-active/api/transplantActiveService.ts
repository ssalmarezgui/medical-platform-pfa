import axios from 'axios';
import { Transplantation, CreateTransplantationDTO } from '../types/transplantActive';

const API_URL = 'http://localhost:8081/api/transplantations';

export const transplantActiveService = {
  getByPatientId: async (patientId?: string): Promise<Transplantation[]> => {
    const { data } = await axios.get<Transplantation[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },
  create: async (patientId: string, donneurId: number, t: CreateTransplantationDTO): Promise<Transplantation> => {
    const { data } = await axios.post<Transplantation>(`${API_URL}/patient/${patientId}/donneur/${donneurId}`, t);
    return data;
  },

  
  update: async (id: number, t: Partial<Transplantation>): Promise<Transplantation> => {
    const { data } = await axios.put<Transplantation>(`${API_URL}/${id}`, t);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};