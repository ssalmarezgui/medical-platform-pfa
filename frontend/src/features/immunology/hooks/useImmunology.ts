import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { immunologyService } from '../api/immunologyService';
import { BilanImmunologique, CreateBilanImmunologiqueDTO } from '../types/immunology';

export const useImmunologyHistory = (patientId?: string) => {
  return useQuery<BilanImmunologique, Error>({
    queryKey: ['immunologyHistory', patientId],
    queryFn: () => immunologyService.getByPatientId(patientId!),
    enabled: !!patientId,
    retry: false,
  });
};

export const useSaveImmunology = () => {
  const queryClient = useQueryClient();

  return useMutation<BilanImmunologique, Error, { patientId: string; data: CreateBilanImmunologiqueDTO }>({
    mutationFn: ({ patientId, data }) => immunologyService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['immunologyHistory', patientId] });
    },
  });
};

export const useDonorImmunologyHistory = (donorId?: number) => {
  return useQuery<BilanImmunologique, Error>({
    queryKey: ['immunologyHistory', donorId],
    queryFn: () => immunologyService.getByDonorId(donorId!),
    enabled: !!donorId,
    retry: false,
  });
};

export const useSaveDonorImmunology = () => {
  const queryClient = useQueryClient();

  return useMutation<BilanImmunologique, Error, { donorId: number; data: CreateBilanImmunologiqueDTO }>({
    mutationFn: ({ donorId, data }) => immunologyService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['immunologyHistory', donorId] });
    },
  });
};

export const useDeleteImmunology = (subjectId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: immunologyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunologyHistory', subjectId] });
    },
  });
};