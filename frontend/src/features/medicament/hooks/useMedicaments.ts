import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicamentService } from '../api/medicamentService';
import { MedicamentDTO } from '../types/medicament';

export const useMedicamentsList = (type?: string) => {
  return useQuery<MedicamentDTO[], Error>({
    queryKey: ['medicaments', type],
    queryFn: () => medicamentService.getAll(type),
  });
};

export const useCreateMedicament = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicamentDTO, Error, MedicamentDTO>({
    mutationFn: medicamentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicaments'] });
    },
  });
};

export const useUpdateMedicament = () => {
  const queryClient = useQueryClient();

  return useMutation<MedicamentDTO, Error, { id: number; data: Partial<MedicamentDTO> }>({
    mutationFn: ({ id, data }) => medicamentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicaments'] });
    },
  });
};

export const useDeleteMedicament = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: medicamentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicaments'] });
    },
  });
};