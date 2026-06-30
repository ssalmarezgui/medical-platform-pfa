import { useAuthStore } from '../store/useAuthStore';

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return { hasPermission };
};