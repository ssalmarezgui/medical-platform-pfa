import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../api/doctorService';
import { Medecin, CreateMedecinDTO } from '../types/doctors';

export const useDoctors = (serviceId?: number, hopitalId?: string) => {
  return useQuery<Medecin[], Error>({
    queryKey: ['doctors', serviceId, hopitalId],
    queryFn: () => doctorService.getAll(serviceId, hopitalId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation<Medecin, Error, CreateMedecinDTO>({
    mutationFn: doctorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });

      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation<Medecin, Error, { id: number; data: Partial<Medecin> }>({
    mutationFn: ({ id, data }) => doctorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: doctorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};