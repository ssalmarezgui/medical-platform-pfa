import axios from 'axios';
import { MicrobiologieSerologie, CreateMicrobiologieSerologieDTO } from '../types/infectious';

const API_URL = 'http://localhost:8081/api/microbiologie';

export const infectiousService = {
  getAll: async (): Promise<MicrobiologieSerologie[]> => {
    const { data } = await axios.get<MicrobiologieSerologie[]>(API_URL);
    return data;
  },

  
  getByPatientId: async (patientId: string): Promise<MicrobiologieSerologie> => {
    const { data } = await axios.get<MicrobiologieSerologie>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  getByDonorId: async (donorId : number): Promise<MicrobiologieSerologie> => {
    const { data } = await axios.get<MicrobiologieSerologie>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  save: async (patientId: string, ms: CreateMicrobiologieSerologieDTO): Promise<MicrobiologieSerologie> => {
    const { data } = await axios.post<MicrobiologieSerologie>(`${API_URL}/patient/${patientId}`, ms);
    return data;
  },

  saveForDonor: async (donorId: number, ms: CreateMicrobiologieSerologieDTO): Promise<MicrobiologieSerologie> => {
    const { data } = await axios.post<MicrobiologieSerologie>(`${API_URL}/donneur/${donorId}`, ms);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};