import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infectiousService } from '../api/infectiousService';
import { MicrobiologieSerologie, CreateMicrobiologieSerologieDTO } from '../types/infectious';

export const useInfectiousHistory = (patientId?: string) => {
  return useQuery<MicrobiologieSerologie, Error>({
    queryKey: ['infectiousHistory', patientId],
    queryFn: () => infectiousService.getByPatientId(patientId!),
    enabled: !!patientId,
    retry: false,
  });
};

export const useDonorInfectiousHistory = (donorId?: number) => {
  return useQuery<MicrobiologieSerologie, Error>({
    queryKey: ['infectiousHistory', donorId],
    queryFn: () => infectiousService.getByDonorId(donorId!),
    enabled: !!donorId,
    retry: false,
  });
};

export const useSaveInfectious = () => {
  const queryClient = useQueryClient();

  return useMutation<MicrobiologieSerologie, Error, { patientId: string; data: CreateMicrobiologieSerologieDTO }>({
    mutationFn: ({ patientId, data }) => infectiousService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['infectiousHistory', patientId] });
    },
  });
};

export const useSaveDonorInfectious = () => {
  const queryClient = useQueryClient();

  return useMutation<MicrobiologieSerologie, Error, { donorId: number; data: CreateMicrobiologieSerologieDTO }>({
    mutationFn: ({ donorId, data }) => infectiousService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['infectiousHistory', donorId] });
    },
  });
};

export const useDeleteInfectious = (subjectId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: infectiousService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infectiousHistory', subjectId] });
    },
  });
};