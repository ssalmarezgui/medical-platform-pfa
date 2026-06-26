import axios from 'axios';
import { NephropathieInitiale, BilanPreGreffe, Dialyse, ParametresBiopsiques } from '../types/nephropathy';

const API_NI = 'http://localhost:8081/api/nephropathies';
const API_BPG = 'http://localhost:8081/api/bilans-pregreffe';
const API_DIALYSE = 'http://localhost:8081/api/dialyses';
const API_BIOPSIE = 'http://localhost:8081/api/biopsies';

export const nephropathyService = {
  getByPatientId: async (patientId?: string): Promise<NephropathieInitiale[]> => {
    const { data } = await axios.get<NephropathieInitiale[]>(API_NI, {
      params: patientId && patientId.trim() !== "" ? { patientId } : {}
    });
    return data;
  },
  createNI: async (patientId: string, ni: NephropathieInitiale): Promise<NephropathieInitiale> => {
    const { data } = await axios.post<NephropathieInitiale>(`${API_NI}/patient/${patientId}`, ni);
    return data;
  },
  updateNI: async (id: number, ni: NephropathieInitiale): Promise<NephropathieInitiale> => {
    const { data } = await axios.put<NephropathieInitiale>(`${API_NI}/${id}`, ni);
    return data;
  },
  deleteNI: async (id: number): Promise<void> => {
    await axios.delete(`${API_NI}/${id}`);
  },

  getBilanByNI: async (niId: number): Promise<BilanPreGreffe> => {
    const { data } = await axios.get<BilanPreGreffe>(API_BPG, { params: { nephropathieId: niId } });
    return data;
  },
  saveBilan: async (niId: number, bpg: BilanPreGreffe): Promise<BilanPreGreffe> => {
    const { data } = await axios.post<BilanPreGreffe>(`${API_BPG}/nephropathie/${niId}`, bpg);
    return data;
  },

  getDialysesByNI: async (niId: number): Promise<Dialyse[]> => {
    const { data } = await axios.get<Dialyse[]>(API_DIALYSE, { params: { nephropathieId: niId } });
    return data;
  },
  createDialyse: async (niId: number, d: Dialyse): Promise<Dialyse> => {
    const { data } = await axios.post<Dialyse>(`${API_DIALYSE}/nephropathie/${niId}`, d);
    return data;
  },
  deleteDialyse: async (id: number): Promise<void> => {
    await axios.delete(`${API_DIALYSE}/${id}`);
  },

  getBiopsieByNI: async (niId: number): Promise<ParametresBiopsiques> => {
    const { data } = await axios.get<ParametresBiopsiques>(`${API_BIOPSIE}/nephropathie/${niId}`);
    return data;
  },
  saveBiopsie: async (niId: number, pb: ParametresBiopsiques): Promise<ParametresBiopsiques> => {
    const { data } = await axios.post<ParametresBiopsiques>(`${API_BIOPSIE}/nephropathie/${niId}`, pb);
    return data;
  }
};