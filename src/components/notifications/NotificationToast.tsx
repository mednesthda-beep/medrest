"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import type { InAppToastPayload } from "@/lib/notifications";

export function NotificationToast() {
  const [toasts, setToasts] = useState<InAppToastPayload[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<InAppToastPayload>;
      if (customEvent.detail) {
        const newToast = customEvent.detail;
        setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 toasts

        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 6000);
      }
    };

    window.addEventListener("mednest-toast", handleToast);
    return () => {
      window.removeEventListener("mednest-toast", handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isEmergency = toast.type === "emergency";
        const isSuccess = toast.type === "success";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 flex items-start gap-3 ${
              isEmergency
                ? "bg-destructive/95 text-white border-destructive shadow-destructive/30"
                : isSuccess
                ? "bg-card/95 text-foreground border-emerald-500/50 shadow-emerald-500/10"
                : isWarning
                ? "bg-card/95 text-foreground border-amber-500/50 shadow-amber-500/10"
                : "bg-card/95 text-foreground border-border shadow-black/10"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isEmergency && <AlertCircle className="w-5 h-5 text-white animate-bounce" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {!isEmergency && !isSuccess && !isWarning && <Info className="w-5 h-5 text-primary" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-xs font-bold leading-tight ${isEmergency ? "text-white" : "text-foreground"}`}>
                  {toast.title}
                </h4>
                <span className={`text-[10px] shrink-0 font-mono ${isEmergency ? "text-white/80" : "text-muted-foreground"}`}>
                  {toast.timestamp}
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isEmergency ? "text-white/90" : "text-muted-foreground"}`}>
                {toast.body}
              </p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className={`shrink-0 p-1 rounded-lg transition-colors cursor-pointer ${
                isEmergency ? "hover:bg-white/20 text-white" : "hover:bg-secondary text-muted-foreground"
              }`}
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
