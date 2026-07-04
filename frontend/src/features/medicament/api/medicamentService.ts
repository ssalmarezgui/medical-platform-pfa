import axios from 'axios';
import { MedicamentDTO } from '../types/medicament';

const API_URL = 'http://localhost:8081/api/medicaments';

export const medicamentService = {
  getAll: async (type?: string): Promise<MedicamentDTO[]> => {
    const { data } = await axios.get<MedicamentDTO[]>(API_URL, {
      params: type && type.trim() !== "" ? { type } : {}
    });
    return data;
  },

  getById: async (id: number): Promise<MedicamentDTO> => {
    const { data } = await axios.get<MedicamentDTO>(`${API_URL}/${id}`);
    return data;
  },

  create: async (medicament: MedicamentDTO): Promise<MedicamentDTO> => {
    const { data } = await axios.post<MedicamentDTO>(API_URL, medicament);
    return data;
  },

  update: async (id: number, medicament: Partial<MedicamentDTO>): Promise<MedicamentDTO> => {
    const { data } = await axios.put<MedicamentDTO>(`${API_URL}/${id}`, medicament);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};