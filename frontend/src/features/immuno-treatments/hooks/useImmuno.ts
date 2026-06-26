import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { immunoService } from '../api/immunoService';

export const useImmunoHistory = (patientId?: string) => {
  return useQuery({
    queryKey: ['immunoHistory', patientId],
    queryFn: () => immunoService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useMedicaments = () => {
  return useQuery({
    queryKey: ['medicaments'],
    queryFn: immunoService.getMedicaments,
  });
};

export const usePrescriptions = (traitementId?: number) => {
  return useQuery({
    queryKey: ['prescriptions', traitementId],
    queryFn: () => immunoService.getPrescriptions(traitementId!),
    enabled: !!traitementId,
  });
};

export const useDosages = (traitementId?: number) => {
  return useQuery({
    queryKey: ['dosages', traitementId],
    queryFn: () => immunoService.getDosages(traitementId!),
    enabled: !!traitementId,
  });
};