import { create } from 'zustand';

interface User {
  loginU: string;
  roleU: 'ADMIN' | 'MEDECIN_INVESTIGATEUR' | 'MEDECIN_SUIVI' | 'AGENT_LABORATOIRE' | 'AGENT_IMMUNO';
  identifiantS?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (loginU: string, roleU: User['roleU'], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (loginU, roleU, token) => set({
    user: { loginU, roleU },
    token,
    isAuthenticated: true
  }),
  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false
  })
}));