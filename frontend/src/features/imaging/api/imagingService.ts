import axios from 'axios';
import { Imagerie, CreateImagerieDTO } from '../types/imaging';

const API_URL = 'http://localhost:8081/api/imageries';

export const imagingService = {
  getByPatientId: async (patientId?: string): Promise<Imagerie[]> => {
    const { data } = await axios.get<Imagerie[]>(API_URL, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },

  create: async (patientId: string, im: CreateImagerieDTO): Promise<Imagerie> => {
    const { data } = await axios.post<Imagerie>(`${API_URL}/patient/${patientId}`, im);
    return data;
  },

  getByDonorId: async (donorId?: number): Promise<Imagerie[]> => {
    const { data } = await axios.get<Imagerie[]>(API_URL, {
      params: donorId ? { donorId } : {}
    });
    return data;
  },

  createForDonor: async (donorId: number, im: CreateImagerieDTO): Promise<Imagerie> => {
    const { data } = await axios.post<Imagerie>(`${API_URL}/donneur/${donorId}`, im);
    return data;
  },

  
  update: async (id: number, im: Partial<Imagerie>): Promise<Imagerie> => {
    const { data } = await axios.put<Imagerie>(`${API_URL}/${id}`, im);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};