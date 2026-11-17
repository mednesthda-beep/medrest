"use client";

import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { 
  AlertTriangle, Phone, BellOff, MapPin, 
  Heart, Wind, Thermometer, ShieldAlert 
} from "lucide-react";

export function EmergencySosModal() {
  const { isSosModalOpen, activeSosAlert, dismissEmergencySos, role } = useAuthStore();
  const { currentData } = useSensorStore();

  if (!isSosModalOpen || !activeSosAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Red ambient alarm glow */}
      <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-destructive/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-card border-2 border-destructive rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Animated Emergency Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-destructive to-red-500 animate-pulse" />

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive flex items-center justify-center shrink-0 shadow-lg shadow-destructive/40 animate-bounce">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-destructive text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                CRITICAL SOS
              </span>
              <span className="text-xs text-muted-foreground">{activeSosAlert.timestamp}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {activeSosAlert.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeSosAlert.message}
            </p>
          </div>
        </div>

        {/* Current Patient Vitals Snapshot */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Live Smart Pillow Vitals</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Connected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-1">
                <Heart className="w-3.5 h-3.5 text-health-heart" /> HR
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.heartRate > 0 ? `${currentData.heartRate}` : "74"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">BPM</span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-1">
                <Wind className="w-3.5 h-3.5 text-health-spo2" /> SpO₂
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.spo2 > 0 ? `${currentData.spo2}` : "98"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-1">
                <Thermometer className="w-3.5 h-3.5 text-health-temp" /> Temp
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.temperature > 0 ? currentData.temperature.toFixed(1) : "36.6"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">°C</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{activeSosAlert.location || "Smart Pillow Bedroom Ward 1"}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5">
          <a
            href="tel:108"
            className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-destructive/30 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Emergency Services (108 / Ambulance)</span>
          </a>

          <div className="flex gap-2.5">
            <button
              onClick={dismissEmergencySos}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-4 rounded-xl border border-border transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <BellOff className="w-4 h-4 text-muted-foreground" />
              <span>{role === 'patient' ? "I'm OK (Dismiss Alert)" : "Acknowledge & Silence"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
