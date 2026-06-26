import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloodService } from '../api/bloodService';
import { BiochimieSang, CreateBiochimieSangDTO } from '../types/blood';

export const useBloodHistory = (patientId?: string) => {
  return useQuery<BiochimieSang, Error>({
    queryKey: ['bloodHistory', patientId],
    queryFn: () => bloodService.getByPatientId(patientId!),
    enabled: !!patientId, // N'exécute l'appel que si un patientId est fourni
    retry: false, // Évite d'insister si le patient n'a pas encore de fiche
  });
};

export const useSaveBlood = () => {
  const queryClient = useQueryClient();

  return useMutation<BiochimieSang, Error, { patientId: string; data: CreateBiochimieSangDTO }>({
    mutationFn: ({ patientId, data }) => bloodService.save(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['bloodHistory', patientId] });
    },
  });
};


export const useDonorBloodHistory = (donorId?: number) => {
  return useQuery<BiochimieSang, Error>({
    queryKey: ['bloodHistory', donorId],
    queryFn: () => bloodService.getByDonorId(donorId!),
    enabled: !!donorId, // N'exécute l'appel que si un patientId est fourni
    retry: false, // Évite d'insister si le patient n'a pas encore de fiche
  });
};

export const useSaveDonorBlood = () => {
  const queryClient = useQueryClient();

  return useMutation<BiochimieSang, Error, { donorId: number; data: CreateBiochimieSangDTO }>({
    mutationFn: ({ donorId, data }) => bloodService.saveForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['bloodHistory', donorId] });
    },
  });
};

export const useDeleteBlood = (subjectId: number |  string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: bloodService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodHistory', subjectId] });
    },
  });
};