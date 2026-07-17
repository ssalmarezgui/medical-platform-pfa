import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  target: string;
  details: string;
}

export const useAuditLogs = () => {
  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8081/api/v1/admin/audit-logs');
      return response.data;
    }
  });
};