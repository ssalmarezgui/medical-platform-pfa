import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hematologyService } from '../api/hematologyService';
import { HemotologieHemostase, CreateHematologyDTO } from '../types/hematology';

export const useHematologyHistory = (patientId?: string) => {
  return useQuery<HemotologieHemostase, Error>({
    queryKey: ['hematologyHistory', patientId],
    queryFn: () => hematologyService.getByPatientId(patientId!),
    enabled: !!patientId,
    retry: false,
  });
};

export const useDonorHematologyHistory = (donorId?: number) => {
  return useQuery<HemotologieHemostase, Error>({
    queryKey: ['hematologyHistory', donorId],
    queryFn: () => hematologyService.getByDonorId(donorId!),
    enabled: !!donorId,
    retry: false, 
  });
};

export const useSaveHematology = () => {
  const queryClient = useQueryClient();

  return useMutation<HemotologieHemostase, Error, { patientId: string; data: CreateHematologyDTO }>({
    mutationFn: ({ patientId, data }) => hematologyService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['hematologyHistory', patientId] });
    },
  });
};


export const useSaveDonorHematology = () => {
  const queryClient = useQueryClient();

  return useMutation<HemotologieHemostase, Error, { donorId: number; data: CreateHematologyDTO }>({
    mutationFn: ({ donorId, data }) => hematologyService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['hematologyHistory', donorId] });
    },
  });
};

export const useDeleteHematology = (subjectId: string | number ) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: hematologyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hematologyHistory', subjectId] });
    },
  });
};