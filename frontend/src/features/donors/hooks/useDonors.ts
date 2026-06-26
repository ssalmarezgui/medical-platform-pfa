import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorService } from '../api/donorService';
import { Donneur, CreateDonneurDTO } from '../types/donors';

export const useDonors = () => {
  return useQuery<Donneur[], Error>({
    queryKey: ['donors'],
    queryFn: donorService.getAll,
    staleTime: 5 * 60 * 1000,
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