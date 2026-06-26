import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nephropathyService } from '../api/nephropathyService';

export const useNephropathyHistory = (patientId?: string) => {
  return useQuery({
    queryKey: ['nephropathyHistory', patientId],
    queryFn: () => nephropathyService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

export const useBilanHistory = (niId?: number) => {
  return useQuery({
    queryKey: ['bilanHistory', niId],
    queryFn: () => nephropathyService.getBilanByNI(niId!),
    enabled: !!niId,
    retry: false,
  });
};

export const useDialyseHistory = (niId?: number) => {
  return useQuery({
    queryKey: ['dialyseHistory', niId],
    queryFn: () => nephropathyService.getDialysesByNI(niId!),
    enabled: !!niId,
  });
};

export const useBiopsieHistory = (niId?: number) => {
  return useQuery({
    queryKey: ['biopsieHistory', niId],
    queryFn: () => nephropathyService.getBiopsieByNI(niId!),
    enabled: !!niId,
    retry: false,
  });
};