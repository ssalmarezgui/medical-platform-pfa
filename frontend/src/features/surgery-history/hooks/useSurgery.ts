import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surgeryService } from '../api/surgeryService';
import { AntecedentChirurgical, CreateAntecedentChirurgicalDTO } from '../types/surgery';

export const useSurgeryHistory = (patientId?: string) => {
  return useQuery<AntecedentChirurgical[], Error>({
    queryKey: ['surgeryHistory', patientId],
    queryFn: () => surgeryService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useDonorSurgeryHistory = (donorId?: number) => {
  return useQuery<AntecedentChirurgical[], Error>({
    queryKey: ['surgeryHistory', donorId],
    queryFn: () => surgeryService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateSurgery = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentChirurgical, Error, { patientId: string; data: CreateAntecedentChirurgicalDTO }>({
    mutationFn: ({ patientId, data }) => surgeryService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryHistory', patientId] });
    },
  });
};


export const useCreateDonorSurgery = () => {
  const queryClient = useQueryClient();

  return useMutation<AntecedentChirurgical, Error, { donorId: number; data: CreateAntecedentChirurgicalDTO }>({
    mutationFn: ({ donorId, data }) => surgeryService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryHistory', donorId] });
    },
  });
};


export const useDeleteSurgery = (subjectId : number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: surgeryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeryHistory', subjectId] });
    },
  });
};