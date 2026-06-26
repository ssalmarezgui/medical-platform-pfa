import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transplantActiveService } from '../api/transplantActiveService';
import { Transplantation, CreateTransplantationDTO } from '../types/transplantActive';

export const useTransplantActiveHistory = (patientId?: string) => {
  return useQuery<Transplantation[], Error>({
    queryKey: ['transplantActiveHistory', patientId],
    queryFn: () => transplantActiveService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useCreateTransplantActive = () => {
  const queryClient = useQueryClient();

  return useMutation<Transplantation, Error, { patientId: string; donneurId: number; data: CreateTransplantationDTO }>({
    mutationFn: ({ patientId, donneurId, data }) => transplantActiveService.create(patientId, donneurId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['transplantActiveHistory', patientId] });
    },
  });
};

export const useDeleteTransplantActive = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: transplantActiveService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transplantActiveHistory', patientId] });
    },
  });
};