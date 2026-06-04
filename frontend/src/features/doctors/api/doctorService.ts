import axios from 'axios';
import { Medecin, CreateMedecinDTO } from '../types/doctors';

const API_URL = 'http://localhost:8081/api/medecins';

export const doctorService = {
  getAll: async (serviceId?: number, hopitalId?: string): Promise<Medecin[]> => {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId;
    if (hopitalId) params.hopitalId = hopitalId;

    const { data } = await axios.get<Medecin[]>(API_URL, { params });
    return data;
  },

  getById: async (id: number): Promise<Medecin> => {
    const { data } = await axios.get<Medecin>(`${API_URL}/${id}`);
    return data;
  },

  create: async (medecin: CreateMedecinDTO): Promise<Medecin> => {
    const { data } = await axios.post<Medecin>(API_URL, medecin);
    return data;
  },

  update: async (id: number, medecin: Partial<Medecin>): Promise<Medecin> => {
    const { data } = await axios.put<Medecin>(`${API_URL}/${id}`, medecin);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  assignToService: async (medecinId: number, serviceId: number): Promise<Medecin> => {
    const { data } = await axios.post<Medecin>(`${API_URL}/${medecinId}/services/${serviceId}`);
    return data;
  },

  removeFromService: async (medecinId: number, serviceId: number): Promise<Medecin> => {
    const { data } = await axios.delete<Medecin>(`${API_URL}/${medecinId}/services/${serviceId}`);
    return data;
  }
};