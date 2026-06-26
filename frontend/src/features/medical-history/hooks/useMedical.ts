import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalService } from '../api/medicalService';
import { AntecedentMedical, CreateAntecedentMedicalDTO } from '../types/medical';

export const useMedicalHistory = (patientId?: string) => {
  return useQuery<AntecedentMedical[], Error>({
    queryKey: ['medicalHistory', patientId],
    queryFn: () => medicalService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useCreateMedical = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentMedical, Error, { patientId: string; data: CreateAntecedentMedicalDTO }>({
    mutationFn: ({ patientId, data }) => medicalService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', patientId] });
    },
  });
};

export const useDonorMedicalHistory = (donorId?: number) => {
  return useQuery<AntecedentMedical[], Error>({
    queryKey: ['medicalHistory', donorId],
    queryFn: () => medicalService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateDonorMedical = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentMedical, Error, { donorId: number; data: CreateAntecedentMedicalDTO }>({
    mutationFn: ({ donorId, data }) => medicalService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', donorId] });
    },
  });
};

export const useDeleteMedical = (subjectId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: medicalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', subjectId] });
    },
  });
};