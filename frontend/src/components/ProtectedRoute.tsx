import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Si l'utilisateur n'est pas connecté, on le redirige vers l'écran de Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si l'utilisateur est connecté mais n'a pas le rôle autorisé pour cette page
  if (allowedRoles && user && !allowedRoles.includes(user.roleU)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};