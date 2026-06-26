import axios from 'axios';
import { BiochimieUrines, CreateBiochimieUrinesDTO } from '../types/urine';

const API_URL = 'http://localhost:8081/api/biochimie-urinaire';

export const urineService = {
  // Récupérer toutes les fiches de biochimie urinaire de la cohorte (GET /api/biochimie-urinaire)
  getAll: async (): Promise<BiochimieUrines[]> => {
    const { data } = await axios.get<BiochimieUrines[]>(API_URL);
    return data;
  },

  // Récupérer la fiche de biochimie urinaire d'un patient
  getByPatientId: async (patientId: string): Promise<BiochimieUrines> => {
    const { data } = await axios.get<BiochimieUrines>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  // Créer ou mettre à jour
  save: async (patientId: string, bu: CreateBiochimieUrinesDTO): Promise<BiochimieUrines> => {
    const { data } = await axios.post<BiochimieUrines>(`${API_URL}/patient/${patientId}`, bu);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<BiochimieUrines> => {
    const { data } = await axios.get<BiochimieUrines>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  // Créer ou mettre à jour
  saveForDonor: async (donorId: number, bu: CreateBiochimieUrinesDTO): Promise<BiochimieUrines> => {
    const { data } = await axios.post<BiochimieUrines>(`${API_URL}/donneur/${donorId}`, bu);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};