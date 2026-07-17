import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface HospitalStat {
  hospitalName: string;
  patientCount: number;
}

export interface TransplantStat {
  date: string;
  transplantCount: number;
}

export interface AdminDashboardStats {
  activeDoctorsCount: number;
  pendingDoctorsCount: number;
  hospitalsCount: number;
  servicesCount: number;
  patientsPerHospital: HospitalStat[];
  transplantsPerDay: TransplantStat[];
}

export const useAdminDashboardStats = () => {
  return useQuery<AdminDashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8081/api/v1/admin/dashboard-stats');
      return response.data;
    }
  });
};