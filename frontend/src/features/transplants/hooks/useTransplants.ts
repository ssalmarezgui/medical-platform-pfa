import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transplantService } from '../api/transplantService';
import { TransplantationAnterieure, CreateTransplantationAnterieureDTO } from '../types/transplants';

export const useTransplantHistory = (patientId?: string) => {
  return useQuery<TransplantationAnterieure[], Error>({
    queryKey: ['transplantHistory', patientId],
    queryFn: () => transplantService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useCreateTransplant = () => {
  const queryClient = useQueryClient();

  return useMutation<TransplantationAnterieure, Error, { patientId: string; data: CreateTransplantationAnterieureDTO }>({
    mutationFn: ({ patientId, data }) => transplantService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['transplantHistory', patientId] });
    },
  });
};

export const useDeleteTransplant = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: transplantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transplantHistory', patientId] });
    },
  });
};