import axios from 'axios';
import { Patient, CreatePatientDTO } from '../types/patients';

const API_URL = 'http://localhost:8081/api/patients';

export const patientService = {
  getAll: async (serviceId?: number, medecinId?: number, hopitalId?: string): Promise<Patient[]> => {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId;
    if (medecinId) params.medecinId = medecinId;
    if (hopitalId) params.hopitalId = hopitalId;

    const { data } = await axios.get<Patient[]>(API_URL, { params });
    return data;
  },

  getById: async (id: number): Promise<Patient> => {
    const { data } = await axios.get<Patient>(`${API_URL}/${id}`);
    return data;
  },

  create: async (patient: CreatePatientDTO): Promise<Patient> => {
    const { data } = await axios.post<Patient>(API_URL, patient);
    return data;
  },

  update: async (id: number, patient: Partial<Patient>): Promise<Patient> => {
    const { data } = await axios.put<Patient>(`${API_URL}/${id}`, patient);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  assignToService: async (patientId: string, serviceId: number): Promise<Patient> => {
    const { data } = await axios.post<Patient>(`${API_URL}/${patientId}/services/${serviceId}`);
    return data;
  },

  removeFromService: async (patientId: string, serviceId: number): Promise<Patient> => {
    const { data } = await axios.delete<Patient>(`${API_URL}/${patientId}/services/${serviceId}`);
    return data;
  }
};