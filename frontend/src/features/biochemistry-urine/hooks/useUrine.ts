import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { urineService } from '../api/urineService';
import { BiochimieUrines, CreateBiochimieUrinesDTO } from '../types/urine';

export const useUrineHistory = (patientId?: string) => {
  return useQuery<BiochimieUrines, Error>({
    queryKey: ['urineHistory', patientId],
    queryFn: () => urineService.getByPatientId(patientId!),
    enabled: !!patientId, // N'exécute l'appel que si un patientId est fourni
    retry: false, // Évite d'insister si le patient n'a pas encore de fiche
  });
};

export const useDonorUrineHistory = (donorId?: number) => {
  return useQuery<BiochimieUrines, Error>({
    queryKey: ['urineHistory', donorId],
    queryFn: () => urineService.getByDonorId(donorId!),
    enabled: !!donorId, // N'exécute l'appel que si un patientId est fourni
    retry: false, // Évite d'insister si le patient n'a pas encore de fiche
  });
};

export const useSaveUrine = () => {
  const queryClient = useQueryClient();

  return useMutation<BiochimieUrines, Error, { patientId: string; data: CreateBiochimieUrinesDTO }>({
    mutationFn: ({ patientId, data }) => urineService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['urineHistory', patientId] });
    },
  });
};

export const useSaveDonorUrine = () => {
  const queryClient = useQueryClient();

  return useMutation<BiochimieUrines, Error, { donorId: number; data: CreateBiochimieUrinesDTO }>({
    mutationFn: ({ donorId, data }) => urineService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['urineHistory', donorId] });
    },
  });
};

export const useDeleteUrine = (subjectId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: urineService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urineHistory', subjectId] });
    },
  });
};