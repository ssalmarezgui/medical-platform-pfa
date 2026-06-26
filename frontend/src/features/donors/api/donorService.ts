import axios from 'axios';
import { Donneur, CreateDonneurDTO } from '../types/donors';

const API_URL = 'http://localhost:8081/api/donneurs'; // Ajuste si ta route backend est différente

export const donorService = {
  getAll: async (): Promise<Donneur[]> => {
    const { data } = await axios.get<Donneur[]>(API_URL);
    return data;
  },

  getById: async (id: number): Promise<Donneur> => {
    const { data } = await axios.get<Donneur>(`${API_URL}/${id}`);
    return data;
  },

  create: async (donor: CreateDonneurDTO): Promise<Donneur> => {
    const { data } = await axios.post<Donneur>(API_URL, donor);
    return data;
  },

  update: async (id: number, donor: Partial<Donneur>): Promise<Donneur> => {
    const { data } = await axios.put<Donneur>(`${API_URL}/${id}`, donor);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};