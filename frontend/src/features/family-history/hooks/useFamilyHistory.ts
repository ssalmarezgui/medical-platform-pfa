import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyHistoryService } from '../api/familyHistoryService';
import { AntecedentFamilial, CreateAntecedentFamilialDTO } from '../types/familyHistory';

export const useFamilyHistory = (patientId?: string) => {
  return useQuery<AntecedentFamilial[], Error>({
    queryKey: ['familyHistory', patientId],
    queryFn: () => familyHistoryService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useDonorFamilyHistory = (donorId?: number) => {
  return useQuery<AntecedentFamilial[], Error>({
    queryKey: ['familyHistory', donorId],
    queryFn: () => familyHistoryService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentFamilial, Error, { patientId: string; data: CreateAntecedentFamilialDTO }>({
    mutationFn: ({ patientId, data }) => familyHistoryService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory', patientId] });
    },
  });
};

export const useCreateDonorFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentFamilial, Error, { donorId: number; data: CreateAntecedentFamilialDTO }>({
    mutationFn: ({ donorId, data }) => familyHistoryService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory', donorId] });
    },
  });
};

export const useDeleteFamilyHistory = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: familyHistoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory', patientId] });
    },
  });
};

export const useDeleteDonorFamilyHistory = (donorId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: familyHistoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory', donorId] });
    },
  });
};