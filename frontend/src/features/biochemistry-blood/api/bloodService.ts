import axios from 'axios';
import { BiochimieSang, CreateBiochimieSangDTO } from '../types/blood';

const API_URL = 'http://localhost:8081/api/biochimie-sanguine';

export const bloodService = {
  // Récupérer toutes les fiches de biochimie sanguine de la cohorte (GET /api/biochimie-sanguine)
  getAll: async (): Promise<BiochimieSang[]> => {
    const { data } = await axios.get<BiochimieSang[]>(API_URL);
    return data;
  },

  // Récupérer la fiche de biochimie sanguine d'un patient
  getByPatientId: async (patientId: string): Promise<BiochimieSang> => {
    const { data } = await axios.get<BiochimieSang>(`${API_URL}/patient/${patientId}`);
    return data;
  },

  // Créer ou mettre à jour
  save: async (patientId: string, bs: CreateBiochimieSangDTO): Promise<BiochimieSang> => {
    const { data } = await axios.post<BiochimieSang>(`${API_URL}/patient/${patientId}`, bs);
    return data;
  },

  getByDonorId: async (donorId: number): Promise<BiochimieSang> => {
    const { data } = await axios.get<BiochimieSang>(`${API_URL}/donneur/${donorId}`);
    return data;
  },

  // Créer ou mettre à jour
  saveForDonor: async (donorId: number, bs: CreateBiochimieSangDTO): Promise<BiochimieSang> => {
    const { data } = await axios.post<BiochimieSang>(`${API_URL}/donneur/${donorId}`, bs);
    return data;
  },

  
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};