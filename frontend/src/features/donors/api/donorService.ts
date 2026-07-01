import axios from 'axios';
import { Donneur, CreateDonneurDTO } from '../types/donors';
import { useAuthStore } from '../../../store/useAuthStore';

const API_URL = 'http://localhost:8081/api/donneurs';


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

export const donorService = {
  getAll: async (hopitalId?: string): Promise<Donneur[]> => {
    const params: any = {};
    if (hopitalId) params.hopitalId = hopitalId;
    const { data } = await api.get<Donneur[]>(API_URL, { params });
    return data;
  },

  getById: async (id: number): Promise<Donneur> => {
    const { data } = await api.get<Donneur>(`${API_URL}/${id}`);
    return data;
  },

  create: async (donor: CreateDonneurDTO): Promise<Donneur> => {
    const { data } = await api.post<Donneur>(API_URL, donor);
    return data;
  },

  update: async (id: number, donor: Partial<Donneur>): Promise<Donneur> => {
    const { data } = await api.put<Donneur>(`${API_URL}/${id}`, donor);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  }
};