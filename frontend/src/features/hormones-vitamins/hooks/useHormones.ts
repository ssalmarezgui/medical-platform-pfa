import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hormoneService } from '../api/hormoneService';
import { HormonesVitamines, CreateHormonesVitaminesDTO } from '../types/hormones';

export const useHormoneHistory = (patientId?: string) => {
  return useQuery<HormonesVitamines, Error>({
    queryKey: ['hormoneHistory', patientId],
    queryFn: () => hormoneService.getByPatientId(patientId!),
    enabled: !!patientId,
    retry: false,
  });
};

export const useDonorHormoneHistory = (donorId?: number) => {
  return useQuery<HormonesVitamines, Error>({
    queryKey: ['hormoneHistory', donorId],
    queryFn: () => hormoneService.getByDonorId(donorId!),
    enabled: !!donorId, 
    retry: false,
  });
};

export const useSaveHormones = () => {
  const queryClient = useQueryClient();

  return useMutation<HormonesVitamines, Error, { patientId: string; data: CreateHormonesVitaminesDTO }>({
    mutationFn: ({ patientId, data }) => hormoneService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['hormoneHistory', patientId] });
    },
  });
};

export const useSaveDonorHormones = () => {
  const queryClient = useQueryClient();

  return useMutation<HormonesVitamines, Error, { donorId: number; data: CreateHormonesVitaminesDTO }>({
    mutationFn: ({ donorId, data }) => hormoneService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['hormoneHistory', donorId] });
    },
  });
};

export const useDeleteHormones = (subjectId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: hormoneService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hormoneHistory', subjectId] });
    },
  });
};