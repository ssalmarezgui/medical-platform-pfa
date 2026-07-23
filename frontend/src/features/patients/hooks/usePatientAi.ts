import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useGenerateSummary = () => {
  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await axios.get(`http://localhost:8081/api/v1/patients/${patientId}/ai-summary`);
      return response.data.result;
    }
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await axios.get(`http://localhost:8081/api/v1/patients/${patientId}/ai-report`);
      return response.data.result; 
    }
  });
};