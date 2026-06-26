import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../api/medicationService';
import { MedicamentLongCours, CreateMedicamentLongCoursDTO } from '../types/medications';

export const useMedicationHistory = (patientId?: string) => {
  return useQuery<MedicamentLongCours[], Error>({
    queryKey: ['medicationHistory', patientId],
    queryFn: () => medicationService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useDonorMedicationHistory = (donorId?: number) => {
  return useQuery<MedicamentLongCours[], Error>({
    queryKey: ['medicationHistory', donorId],
    queryFn: () => medicationService.getByDonorId(donorId!),
    enabled: !!donorId,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicamentLongCours, Error, { patientId: string; data: CreateMedicamentLongCoursDTO }>({
    mutationFn: ({ patientId, data }) => medicationService.create(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['medicationHistory', patientId] });
    },
  });
};

export const useCreateDonorMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicamentLongCours, Error, { donorId: number; data: CreateMedicamentLongCoursDTO }>({
    mutationFn: ({ donorId, data }) => medicationService.createForDonor(donorId, data),
    onSuccess: (_, { donorId }) => {
      queryClient.invalidateQueries({ queryKey: ['medicationHistory', donorId] });
    },
  });
};

export const useDeleteMedication = (subjectId: string | number ) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: medicationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationHistory', subjectId] });
    },
  });
};