import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obgynService } from '../api/obgynService';
import { AntecedentGynecoObstetrique, CreateObgynDTO } from '../types/obgyn';

export const useObgynHistory = (patientId?: string, isFemale?: boolean) => {
  return useQuery<AntecedentGynecoObstetrique, Error>({
    queryKey: ['obgynHistory', patientId],
    queryFn: () => obgynService.getByPatientId(patientId!),
    enabled: !!patientId && isFemale === true, 
    retry: false,
  });
};

export const useDonorObgynHistory = (donorId?: number, isFemale?: boolean) => {
  return useQuery<AntecedentGynecoObstetrique, Error>({
    queryKey: ['obgynHistory', donorId],
    queryFn: () => obgynService.getByDonorId(donorId!),
    enabled: !!donorId && isFemale === true, 
    retry: false,
  });
};

export const useCreateObgyn = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentGynecoObstetrique, Error, { patientId: string; data: CreateObgynDTO }>({
    mutationFn: ({ patientId, data }) => obgynService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['obgynHistory', patientId] });
    },
  });
};

export const useCreateDonorObgyn = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentGynecoObstetrique, Error, { donorId: number; data: CreateObgynDTO }>({
    mutationFn: ({ donorId, data }) => obgynService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['obgynHistory', donorId] });
    },
  });
};

export const useUpdateObgyn = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentGynecoObstetrique, Error, { id: number; data: Partial<AntecedentGynecoObstetrique> }>({
    mutationFn: ({ id, data }) => obgynService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['obgynHistory'] });
    },
  });
};
