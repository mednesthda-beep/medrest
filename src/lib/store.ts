import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
}

interface AuthState {
  user: UserProfile | null;
  role: 'patient' | 'guardian' | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setUser: (user: UserProfile | null, role: 'patient' | 'guardian' | null) => void;
  toggleDemoMode: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isDemoMode: true, // Default to demo mode for prototype
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  setUser: (user, role) => set({ user, role, isAuthenticated: !!user }),
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}));
