import axios from 'axios';
import { ServiceMedical, CreateServiceDTO } from '../types/services';

const API_URL = 'http://localhost:8081/api/services';

export const serviceService = {
  getAll: async (hopitalId?: string): Promise<ServiceMedical[]> => {
    const { data } = await axios.get<ServiceMedical[]>(API_URL, {
      params: hopitalId ? { hopitalId } : {}
    });
    return data;
  },

  getById: async (id: number): Promise<ServiceMedical> => {
    const { data } = await axios.get<ServiceMedical>(`${API_URL}/${id}`);
    return data;
  },

  getByHopital: async (hopitalId: string): Promise<ServiceMedical[]> => {
    const { data } = await axios.get<ServiceMedical[]>(`${API_URL}/hopital/${hopitalId}`);
    return data;
  },

  create: async (hopitalId: string, service: CreateServiceDTO): Promise<ServiceMedical> => {
    const { data } = await axios.post<ServiceMedical>(`${API_URL}/hopital/${hopitalId}`, service);
    return data;
  },

  update: async (id: number, service: Partial<ServiceMedical>): Promise<ServiceMedical> => {
    const { data } = await axios.put<ServiceMedical>(`${API_URL}/${id}`, service);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};