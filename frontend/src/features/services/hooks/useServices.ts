import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../api/serviceService';
import { ServiceMedical, CreateServiceDTO } from '../types/services';

export const useServices = (hopitalId?: string) => {
  return useQuery<ServiceMedical[], Error>({
    queryKey: ['services', hopitalId],
    queryFn: () => serviceService.getAll(hopitalId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceMedical, Error, { hopitalId: string; service: CreateServiceDTO }>({
    mutationFn: ({ hopitalId, service }) => serviceService.create(hopitalId, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceMedical, Error, { id: number; data: Partial<ServiceMedical> }>({
    mutationFn: ({ id, data }) => serviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: serviceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};