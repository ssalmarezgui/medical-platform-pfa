import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface PendingUser {
  uuid: string;
  loginU: string;
  emailU: string;
  roleU: string;
  active: boolean;
  medecinId?: number;
}

const API_URL = 'http://localhost:8081/api/v1/users';

export const usePendingUsers = () => {
  return useQuery<PendingUser[]>({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/pending`);
      return response.data;
    }
  });
};

export const useAllUsers = () => {
  return useQuery<PendingUser[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axios.get(API_URL);
      return response.data;
    }
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await axios.put(`${API_URL}/${uuid}/toggle-status`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    }
  });
};