import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { markerService } from '../api/markerService';
import { MarqueursTumoraux, CreateMarqueursTumorauxDTO } from '../types/markers';

export const useMarkerHistory = (patientId?: string) => {
  return useQuery<MarqueursTumoraux, Error>({
    queryKey: ['markerHistory', patientId],
    queryFn: () => markerService.getByPatientId(patientId!),
    enabled: !!patientId,
    retry: false,
  });
};

export const useDonorMarkerHistory = (donorId?: number) => {
  return useQuery<MarqueursTumoraux, Error>({
    queryKey: ['markerHistory', donorId],
    queryFn: () => markerService.getByDonorId(donorId!),
    enabled: !!donorId, 
    retry: false,
  });
};

export const useSaveMarker = () => {
  const queryClient = useQueryClient();

  return useMutation<MarqueursTumoraux, Error, { patientId: string; data: CreateMarqueursTumorauxDTO }>({
    mutationFn: ({ patientId, data }) => markerService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['markerHistory', patientId] });
    },
  });
};

export const useSaveDonorMarker = () => {
  const queryClient = useQueryClient();

  return useMutation<MarqueursTumoraux, Error, { donorId: number; data: CreateMarqueursTumorauxDTO }>({
    mutationFn: ({ donorId, data }) => markerService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['markerHistory', donorId] });
    },
  });
};

export const useDeleteMarker = (subjectId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: markerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markerHistory', subjectId] });
    },
  });
};