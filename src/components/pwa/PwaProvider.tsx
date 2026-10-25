"use client";

import { useEffect, useState } from "react";
import { useAuthStore, BeforeInstallPromptEvent } from "@/lib/store";
import { InstallAppModal } from "./InstallAppModal";
import { WifiOff, Download, Sparkles } from "lucide-react";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { setPwaInstallPrompt, setIsStandalone, isStandalone, setInstallModalOpen } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[MedNest PWA] Service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[MedNest PWA] Service worker registration error:', err);
        });
    }

    // 3. Listen for BeforeInstallPrompt event (Chrome / Android / Edge / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setPwaInstallPrompt(promptEvent);
      
      // Show install banner if not dismissed before
      const hasDismissed = localStorage.getItem('mednest_pwa_dismissed');
      if (!hasDismissed) {
        setShowBanner(true);
      }
    };

    // 4. Listen for successful install
    const handleAppInstalled = () => {
      console.log('[MedNest PWA] App was successfully installed!');
      setPwaInstallPrompt(null);
      setIsStandalone(true);
      setShowBanner(false);
    };

    // 5. Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setPwaInstallPrompt, setIsStandalone]);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('mednest_pwa_dismissed', 'true');
  };

  return (
    <>
      {children}
      <InstallAppModal />

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 backdrop-blur text-black text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline Mode Active — Viewing cached patient telemetry</span>
        </div>
      )}

      {/* Floating PWA Quick Install Banner for mobile/tablet */}
      {showBanner && !isStandalone && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-gradient-to-r from-card to-secondary/90 border border-primary/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">Get the MedNest App</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install to your phone for emergency alarms and instant smart pillow telemetry.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setInstallModalOpen(true);
                    setShowBanner(false);
                  }}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  onClick={dismissBanner}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
