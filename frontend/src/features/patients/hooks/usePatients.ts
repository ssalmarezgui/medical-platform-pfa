import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../api/patientService';
import { Patient, CreatePatientDTO } from '../types/patients';

export const usePatients = (serviceId?: number, medecinId?: number, hopitalId?: string) => {
  return useQuery<Patient[], Error>({
    queryKey: ['patients', serviceId, medecinId, hopitalId],
    queryFn: () => patientService.getAll(serviceId, medecinId, hopitalId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, CreatePatientDTO>({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, { id: number; data: Partial<Patient> }>({
    mutationFn: ({ id, data }) => patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};