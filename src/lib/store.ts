import { create } from 'zustand';
import { playEmergencySiren, stopEmergencySiren } from './alarmAudio';
import { hapticFeedback } from './haptics';
import { sendLocalNotification } from './notifications';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
}

export interface SosAlertData {
  title: string;
  message: string;
  timestamp: string;
  location?: string;
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
  isSosModalOpen: boolean;
  activeSosAlert: SosAlertData | null;
  setTheme: (theme: 'dark' | 'light') => void;
  setUser: (user: UserProfile | null, role: 'patient' | 'guardian' | null) => void;
  setRole: (role: 'patient' | 'guardian') => void;
  toggleDemoMode: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  setInstallModalOpen: (open: boolean) => void;
  setPwaInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsStandalone: (isStandalone: boolean) => void;
  triggerEmergencySos: (title?: string, message?: string) => void;
  dismissEmergencySos: () => void;
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
  isSosModalOpen: false,
  activeSosAlert: null,

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

  triggerEmergencySos: (title = '🚨 CRITICAL EMERGENCY SOS ACTIVATED', message = 'Smart pillow distress signal triggered. Immediate caregiver / medical assistance requested.') => {
    const alertData: SosAlertData = {
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
      location: 'Smart Bed Chamber 1, Home Ward',
    };

    set({ isSosModalOpen: true, activeSosAlert: alertData });

    // 1. Play loud emergency siren via Web Audio
    playEmergencySiren(8);

    // 2. Continuous emergency vibration on mobile devices
    hapticFeedback.alarm();

    // 3. Dispatch system push notification
    sendLocalNotification(title, {
      body: message,
      tag: 'emergency-sos',
      requireInteraction: true,
      alarm: true,
      url: '/emergency',
    }).catch(() => {});
  },

  dismissEmergencySos: () => {
    stopEmergencySiren();
    hapticFeedback.medium();
    set({ isSosModalOpen: false, activeSosAlert: null });
  },

  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}));
