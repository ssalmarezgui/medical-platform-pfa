import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorService } from '../api/donorService';
import { Donneur, CreateDonneurDTO } from '../types/donors';

export const useDonors = (hopitalId?: string) => {
  return useQuery<Donneur[], Error>({
    queryKey: ['donors', hopitalId],
    queryFn: () => donorService.getAll(hopitalId),
  });
};

export const useCreateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation<Donneur, Error, CreateDonneurDTO>({
    mutationFn: donorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

export const useUpdateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation<Donneur, Error, { id: number; data: Partial<Donneur> }>({
    mutationFn: ({ id, data }) => donorService.update(id, data), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};