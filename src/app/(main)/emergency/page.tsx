"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, MapPin, Phone, CheckCircle2, 
  ShieldAlert, Volume2, ExternalLink, RefreshCw 
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { getPatientLocation, type PatientLocation } from "@/lib/geolocation";
import { stopEmergencySiren } from "@/lib/alarmAudio";
import { 
  triggerAlertAcknowledged, 
  triggerPatientSafeConfirmation 
} from "@/lib/notifications";

export default function EmergencyPage() {
  const { role, user, triggerEmergencySos, dismissEmergencySos, isSosModalOpen } = useAuthStore();
  const { currentData } = useSensorStore();
  const [acknowledged, setAcknowledged] = useState(false);
  const [location, setLocation] = useState<PatientLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Fetch real GPS location on mount
  useEffect(() => {
    setIsLoadingLocation(true);
    getPatientLocation().then((loc) => {
      setLocation(loc);
      setIsLoadingLocation(false);
    });
  }, []);

  const handleManualSos = () => {
    setAcknowledged(false);
    triggerEmergencySos(
      "🚨 EMERGENCY SOS ACTIVATED",
      "Immediate caregiver assistance requested. Patient triggered emergency alarm."
    );
  };

  // 1. Caregiver clicks "Acknowledge Alert"
  const handleAcknowledge = () => {
    setAcknowledged(true);
    stopEmergencySiren();
    const responderName = user?.name || (role === "guardian" ? "Caregiver" : "Emergency Responder");
    triggerAlertAcknowledged(responderName);
    dismissEmergencySos();
  };

  // 2. Patient clicks "I'm OK (Cancel Alarm)"
  const handlePatientSafe = () => {
    setAcknowledged(true);
    stopEmergencySiren();
    triggerPatientSafeConfirmation();
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
                  <Volume2 className="w-3.5 h-3.5 text-destructive" /> Siren Standby / Countdown
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Possible Fall / Distress Detected</h2>
              <div className="text-sm text-foreground/90 space-y-1">
                <p><strong>Ward / Room:</strong> Smart Pillow Chamber 1 (Home Care)</p>
                <p><strong>Alarm Dispatched:</strong> {new Date().toLocaleTimeString()}</p>
                {location && (
                  <p className="text-xs text-muted-foreground font-mono">
                    <strong>GPS Coordinates:</strong> {location.lat}, {location.lng} (±{location.accuracy}m)
                  </p>
                )}
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
                className="bg-destructive hover:bg-destructive/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-destructive/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Acknowledge Alert</span>
              </button>
              
              <button 
                onClick={handlePatientSafe}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-6 rounded-xl transition-colors font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer text-center active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I am OK (Cancel Alarm)</span>
              </button>

              <a 
                href="tel:108"
                className="bg-secondary hover:bg-secondary/80 text-foreground py-2.5 px-4 rounded-xl transition-colors font-medium border border-border flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Emergency 108</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-health-good/10 border border-health-good/20 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-health-good mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-foreground">All Clear • System Normal</h2>
            <p className="text-muted-foreground text-sm mt-1">Emergency alarm was safely acknowledged. Live sensor telemetry is active.</p>
          </div>
          <button
            onClick={handleManualSos}
            className="text-xs font-semibold px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg transition-all cursor-pointer"
          >
            Test Emergency Alarm Again
          </button>
        </div>
      )}

      {/* Patient Location GPS Map Card */}
      <div className="glass-card rounded-2xl p-6 border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Patient GPS Coordinates & Live Location
          </h3>
          {location?.mapsUrl && (
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          )}
        </div>

        <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isLoadingLocation ? "Detecting current coordinates..." : location ? location.address : "Smart Bed Chamber 1, Home Ward"}
            </p>
            {location && (
              <p className="text-xs text-muted-foreground font-mono">
                Latitude: {location.lat} | Longitude: {location.lng} | Radius: ±{location.accuracy}m
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setIsLoadingLocation(true);
              getPatientLocation().then((loc) => {
                setLocation(loc);
                setIsLoadingLocation(false);
              });
            }}
            className="p-2 rounded-lg bg-card hover:bg-secondary border border-border text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLocation ? "animate-spin" : ""}`} />
            <span>Refresh GPS</span>
          </button>
        </div>

        <div className="h-64 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=13.0827,80.2707&zoom=14&size=800x400&sensor=false')] bg-cover bg-center"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <MapPin className="w-9 h-9 text-destructive relative z-10 drop-shadow-lg animate-bounce" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-destructive/30 rounded-full animate-ping" />
            </div>
            <span className="mt-2 px-2.5 py-0.5 rounded-full bg-card/90 border border-border text-[11px] font-mono font-bold shadow-md">
              {location ? `${location.lat}, ${location.lng}` : "13.0827, 80.2707"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
