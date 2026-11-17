"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Phone, CheckCircle2, ShieldAlert, Bell, Volume2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";

export default function EmergencyPage() {
  const { role, triggerEmergencySos, dismissEmergencySos, isSosModalOpen } = useAuthStore();
  const { currentData } = useSensorStore();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleManualSos = () => {
    setAcknowledged(false);
    triggerEmergencySos(
      "🚨 EMERGENCY SOS ACTIVATED",
      "Immediate caregiver assistance requested. Patient triggered emergency alarm."
    );
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    dismissEmergencySos();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
            Emergency Alerts & SOS
          </h1>
          <p className="text-muted-foreground mt-1">Active alarms, fall detection, and emergency dispatch.</p>
        </div>

        {/* Quick Trigger Button */}
        <button
          onClick={handleManualSos}
          className="bg-destructive hover:bg-destructive/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-destructive/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <AlertTriangle className="w-5 h-5 animate-bounce" />
          <span>Trigger Emergency SOS</span>
        </button>
      </header>

      {/* Emergency Banner */}
      {!acknowledged ? (
        <div className="bg-destructive/15 border-2 border-destructive rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-destructive/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="p-4 bg-destructive rounded-2xl shrink-0 shadow-lg shadow-destructive/40 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-destructive text-white text-[11px] font-black uppercase tracking-wider rounded-full animate-pulse">
                  ACTIVE SOS ALARM
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Volume2 className="w-3.5 h-3.5 text-destructive" /> Siren Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Possible Fall / Distress Detected</h2>
              <div className="text-sm text-foreground/90 space-y-1">
                <p><strong>Ward:</strong> Bed Chamber 1 (Home Care)</p>
                <p><strong>Alarm Dispatched:</strong> {new Date().toLocaleTimeString()}</p>
                <div className="flex gap-4 mt-2 font-mono text-xs sm:text-sm bg-background/40 p-2.5 rounded-xl border border-destructive/20 w-fit">
                  <span className="text-health-heart font-bold">HR: {currentData.heartRate > 0 ? `${currentData.heartRate} BPM` : '142 BPM'}</span>
                  <span>•</span>
                  <span className="text-health-spo2 font-bold">SpO₂: {currentData.spo2 > 0 ? `${currentData.spo2}%` : '91%'}</span>
                  <span>•</span>
                  <span className="text-health-temp font-bold">Temp: {currentData.temperature > 0 ? `${currentData.temperature.toFixed(1)}°C` : '36.8°C'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={handleAcknowledge}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-destructive/20 cursor-pointer"
              >
                Acknowledge Alert
              </button>
              {role === 'patient' ? (
                <button 
                  onClick={handleAcknowledge}
                  className="bg-secondary hover:bg-secondary/80 text-foreground py-3 px-6 rounded-xl transition-colors font-medium border border-border cursor-pointer text-center"
                >
                  I&apos;m OK (Cancel Alarm)
                </button>
              ) : (
                <a 
                  href="tel:108"
                  className="bg-secondary hover:bg-secondary/80 text-foreground py-3 px-6 rounded-xl transition-colors font-medium border border-border flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Emergency 108</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-health-good/10 border border-health-good/20 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-health-good mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-foreground">All Clear • System Normal</h2>
            <p className="text-muted-foreground text-sm mt-1">Previous alarm was acknowledged. Smart pillow monitoring is active.</p>
          </div>
          <button
            onClick={handleManualSos}
            className="text-xs font-semibold px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg transition-all cursor-pointer"
          >
            Test Emergency Alarm Again
          </button>
        </div>
      )}

      {/* Map (Simulated) */}
      <div className="glass-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Patient Location
        </h3>
        <div className="h-64 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=34.0522,-118.2437&zoom=13&size=800x400&sensor=false')] bg-cover bg-center"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <MapPin className="w-8 h-8 text-destructive relative z-10 drop-shadow-lg" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-destructive/30 rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
