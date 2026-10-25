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
  isMobileDrawerOpen: boolean;
  isInstallModalOpen: boolean;
  pwaInstallPrompt: BeforeInstallPromptEvent | null;
  isStandalone: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setUser: (user: UserProfile | null, role: 'patient' | 'guardian' | null) => void;
  setRole: (role: 'patient' | 'guardian') => void;
  toggleDemoMode: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  setInstallModalOpen: (open: boolean) => void;
  setPwaInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsStandalone: (isStandalone: boolean) => void;
  logout: () => void;
}

// Window BeforeInstallPromptEvent type helper
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isDemoMode: true, // Default to demo mode for prototype
  theme: 'dark',
  isMobileDrawerOpen: false,
  isInstallModalOpen: false,
  pwaInstallPrompt: null,
  isStandalone: false,

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
  setRole: (role) => set({ role }),
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
  
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
  
  setInstallModalOpen: (open) => set({ isInstallModalOpen: open }),
  setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt }),
  setIsStandalone: (isStandalone) => set({ isStandalone }),

  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}));
