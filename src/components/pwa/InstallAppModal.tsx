"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { requestNotificationPermission, getNotificationPermission } from "@/lib/notifications";
import { hapticFeedback } from "@/lib/haptics";
import { 
  X, Download, Bell, Smartphone, Share2, 
  PlusSquare, ShieldCheck, Check, Sparkles, Activity
} from "lucide-react";

export function InstallAppModal() {
  const { 
    isInstallModalOpen, 
    setInstallModalOpen, 
    pwaInstallPrompt, 
    isStandalone 
  } = useAuthStore();

  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  });

  const [notificationStatus, setNotificationStatus] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >(() => {
    if (typeof window === "undefined") return "default";
    return getNotificationPermission();
  });

  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallModalOpen || isStandalone) {
    return null;
  }

  const handleNativeInstall = async () => {
    hapticFeedback.medium();
    if (!pwaInstallPrompt) return;

    setIsInstalling(true);
    try {
      await pwaInstallPrompt.prompt();
      const choice = await pwaInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        hapticFeedback.success();
        setInstallModalOpen(false);
      }
    } catch (err) {
      console.warn("[PWA] Install prompt failed:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleEnableNotifications = async () => {
    hapticFeedback.light();
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? "granted" : "denied");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Top Ambient Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-primary/20 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={() => {
            hapticFeedback.light();
            setInstallModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-health-spo2 p-0.5 shadow-lg shadow-primary/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">MedNest Guardian</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                PWA App
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Smart Pillow & Healthcare Mobile Companion</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 mb-6 text-xs text-muted-foreground bg-secondary/30 p-3.5 rounded-2xl border border-border/40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant Emergency Alarms & Vibrate Alerts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Real-time ESP32 Pillow Telemetry Stream</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-health-spo2 shrink-0" />
            <span>Full-screen experience without browser URL bar</span>
          </div>
        </div>

        {/* Install Action Area */}
        {pwaInstallPrompt ? (
          <div className="space-y-3">
            <button
              onClick={handleNativeInstall}
              disabled={isInstalling}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? "Installing..." : "Install to Home Screen"}</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              Works offline and launches like a native iOS / Android application.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Instructions */
          <div className="space-y-3">
            <div className="bg-secondary/40 p-4 rounded-2xl border border-border/60 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                How to install on iPhone & iPad:
              </p>
              <ol className="text-xs text-muted-foreground space-y-2 pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong className="text-foreground inline-flex items-center gap-1">Share <Share2 className="w-3.5 h-3.5 text-primary inline" /></strong> button in Safari toolbar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <strong className="text-foreground inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 text-primary inline" /></strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span>Tap <strong className="text-foreground">Add</strong> in top right.</span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          /* Desktop / General Browser Instructions */
          <div className="space-y-3">
            <div className="bg-secondary/40 p-4 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">To install on this device:</p>
              <p>Click the <strong>Install App icon (⊕)</strong> located on the right side of your browser URL address bar, or open your browser menu and choose <strong>Install MedNest Guardian</strong>.</p>
            </div>
          </div>
        )}

        {/* Push Notification Switch */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">Critical Vital Notifications</p>
              <p className="text-[10px] text-muted-foreground">Emergency alerts & bedtime departure</p>
            </div>
          </div>
          {notificationStatus === "granted" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> Enabled
            </span>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
            >
              Enable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
