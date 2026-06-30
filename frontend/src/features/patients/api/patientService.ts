import axios from 'axios';
import { Patient, CreatePatientDTO } from '../types/patients';
// Importation du store d'authentification pour récupérer le token
import { useAuthStore } from '../../../store/useAuthStore';

const API_URL = 'http://localhost:8081/api/patients';

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

export const patientService = {
  getAll: async (serviceId?: number, medecinId?: number, hopitalId?: string): Promise<Patient[]> => {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId;
    if (medecinId) params.medecinId = medecinId;
    if (hopitalId) params.hopitalId = hopitalId;

    const { data } = await api.get<Patient[]>(API_URL, { params });
    return data;
  },

  getById: async (id: number): Promise<Patient> => {
    const { data } = await api.get<Patient>(`${API_URL}/${id}`);
    return data;
  },

  create: async (patient: CreatePatientDTO): Promise<Patient> => {
    const { data } = await api.post<Patient>(API_URL, patient);
    return data;
  },

  update: async (id: number, patient: Partial<Patient>): Promise<Patient> => {
    const { data } = await api.put<Patient>(`${API_URL}/${id}`, patient);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },

  assignToService: async (patientId: string, serviceId: number): Promise<Patient> => {
    const { data } = await api.post<Patient>(`${API_URL}/${patientId}/services/${serviceId}`);
    return data;
  },

  removeFromService: async (patientId: string, serviceId: number): Promise<Patient> => {
    const { data } = await api.delete<Patient>(`${API_URL}/${patientId}/services/${serviceId}`);
    return data;
  }
};