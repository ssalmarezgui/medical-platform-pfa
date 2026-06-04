import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalService } from '../api/hospitalService';
import { HopitalStructureSoin, CreateHopitalDTO } from '../types/hospitals';

export const useHospitals = () => {
  return useQuery<HopitalStructureSoin[], Error>({
    queryKey: ['hospitals'],
    queryFn: hospitalService.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation<HopitalStructureSoin, Error, CreateHopitalDTO>({
    mutationFn: hospitalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useDeleteHospital = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: hospitalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useUpdateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation<
    HopitalStructureSoin,
    Error,
    { id: string; data: Partial<HopitalStructureSoin> }
  >({
    mutationFn: ({ id, data }) => hospitalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};