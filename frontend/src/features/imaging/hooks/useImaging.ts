import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagingService } from '../api/imagingService';
import { Imagerie, CreateImagerieDTO } from '../types/imaging';

export const useImagingHistory = (patientId?: string) => {
  return useQuery<Imagerie[], Error>({
    queryKey: ['imagingHistory', patientId],
    queryFn: () => imagingService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useDonorImagingHistory = (donorId?: number) => {
  return useQuery<Imagerie[], Error>({
    queryKey: ['imagingHistory', donorId],
    queryFn: () => imagingService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateImaging = () => {
  const queryClient = useQueryClient();

  return useMutation<Imagerie, Error, { patientId: string; data: CreateImagerieDTO }>({
    mutationFn: ({ patientId, data }) => imagingService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['imagingHistory', patientId] });
    },
  });
};

export const useCreateDonorImaging = () => {
  const queryClient = useQueryClient();

  return useMutation<Imagerie, Error, { donorId: number; data: CreateImagerieDTO }>({
    mutationFn: ({ donorId, data }) => imagingService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['imagingHistory', donorId] });
    },
  });
};

export const useDeleteImaging = (subjectId : string | number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: imagingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagingHistory', subjectId] });
    },
  });
};