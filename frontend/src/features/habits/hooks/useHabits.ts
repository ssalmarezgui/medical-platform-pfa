import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../api/habitService';
import { Habitude, CreateHabitudeDTO } from '../types/habits';

export const useHabits = (patientId?: string) => {
  return useQuery<Habitude[], Error>({
    queryKey: ['habits', patientId],
    queryFn: () => habitService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useDonorHabits = (donorId?: number) => {
  return useQuery<Habitude[], Error>({
    queryKey: ['habits', donorId],
    queryFn: () => habitService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation<Habitude, Error, { patientId: string; data: CreateHabitudeDTO }>({
    mutationFn: ({ patientId, data }) => habitService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', patientId] });
    },
  });
};

export const useCreateDonorHabit = () => {
  const queryClient = useQueryClient();

  return useMutation<Habitude, Error, { donorId: number; data: CreateHabitudeDTO }>({
    mutationFn: ({ donorId, data }) => habitService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', donorId] });
    },
  });
};

export const useDeleteHabit = (subjectId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: habitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', subjectId] });
    },
  });
};