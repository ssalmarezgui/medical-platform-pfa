import axios from 'axios';
import { HopitalStructureSoin, CreateHopitalDTO } from '../types/hospitals';

const API_URL = 'http://localhost:8081/api/hopitaux';

export const hospitalService = {
  getAll: async (): Promise<HopitalStructureSoin[]> => {
    const { data } = await axios.get<HopitalStructureSoin[]>(API_URL);
    return data;
  },

  getById: async (id: string): Promise<HopitalStructureSoin> => {
    const { data } = await axios.get<HopitalStructureSoin>(`${API_URL}/${id}`);
    return data;
  },

  create: async (hospital: CreateHopitalDTO): Promise<HopitalStructureSoin> => {
    const { data } = await axios.post<HopitalStructureSoin>(API_URL, hospital);
    return data;
  },

  update: async (id: string, hospital: Partial<HopitalStructureSoin>): Promise<HopitalStructureSoin> => {
    const { data } = await axios.put<HopitalStructureSoin>(`${API_URL}/${id}`, hospital);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};