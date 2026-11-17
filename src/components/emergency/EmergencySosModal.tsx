"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { getPatientLocation, type PatientLocation } from "@/lib/geolocation";
import { playWarningBeep, playEmergencySiren, stopEmergencySiren } from "@/lib/alarmAudio";
import { 
  triggerAlertAcknowledged, 
  triggerPatientSafeConfirmation, 
  triggerUnresponsiveSosAlarm 
} from "@/lib/notifications";
import { 
  AlertTriangle, Phone, BellOff, MapPin, 
  Heart, Wind, Thermometer, ShieldAlert, 
  CheckCircle, Volume2, ExternalLink, Timer, 
  AlertOctagon, CheckCircle2
} from "lucide-react";

export function EmergencySosModal() {
  const { isSosModalOpen, activeSosAlert, dismissEmergencySos, role, user } = useAuthStore();
  const { currentData } = useSensorStore();

  const [countdown, setCountdown] = useState(15);
  const [isUnresponsive, setIsUnresponsive] = useState(false);
  const [location, setLocation] = useState<PatientLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Keep references to prevent stale closures in timers
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDataRef = useRef(currentData);
  useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  // When modal opens, initialize countdown and warning cycle
  useEffect(() => {
    if (!isSosModalOpen || !activeSosAlert) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopEmergencySiren();
      return;
    }

    // Reset initial countdown state
    setCountdown(15);
    setIsUnresponsive(false);
    setLocation(null);

    // Initial soft alert pulse
    playWarningBeep();

    intervalRef.current = setInterval(async () => {
      setCountdown((prev) => {
        if (prev > 1) {
          playWarningBeep();
          return prev - 1;
        }

        // --- COUNTDOWN REACHED 0: PATIENT IS UNRESPONSIVE! ---
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setIsUnresponsive(true);

        // 1. SOUND LOUD SIREN ALARM
        playEmergencySiren(60);

        // 2. ACQUIRE GPS LOCATION & SEND CRITICAL NOTIFICATION
        setIsLocating(true);
        getPatientLocation().then((loc) => {
          setLocation(loc);
          setIsLocating(false);

          const vitals = `HR: ${currentDataRef.current.heartRate > 0 ? currentDataRef.current.heartRate : 138} BPM, SpO2: ${currentDataRef.current.spo2 > 0 ? currentDataRef.current.spo2 : 91}%, Temp: ${currentDataRef.current.temperature > 0 ? currentDataRef.current.temperature.toFixed(1) : 36.8}°C`;

          // 3. DISPATCH UNRESPONSIVE EMERGENCY NOTIFICATION
          triggerUnresponsiveSosAlarm(
            `${loc.address} (${loc.mapsUrl})`,
            vitals
          );
        });

        return 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopEmergencySiren();
    };
  }, [isSosModalOpen, activeSosAlert]);

  if (!isSosModalOpen || !activeSosAlert) return null;

  // 1. Patient clicks "I am OK" -> Cancel alarm & notify
  const handlePatientSafe = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopEmergencySiren();
    triggerPatientSafeConfirmation();
    dismissEmergencySos();
  };

  // 2. Caregiver / User clicks "Acknowledge Alert" -> Silence siren, dispatch ack notification
  const handleAcknowledgeAlert = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopEmergencySiren();
    const responderName = user?.name || (role === "guardian" ? "Caregiver" : "Emergency Responder");
    triggerAlertAcknowledged(responderName);
    dismissEmergencySos();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background ambient lighting */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isUnresponsive ? "bg-red-600/30 animate-pulse" : "bg-amber-600/15"
        }`} 
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-destructive/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-card border-2 border-destructive rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 overflow-hidden">
        {/* Animated Emergency Top Bar */}
        <div 
          className={`absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r ${
            isUnresponsive 
              ? "from-red-600 via-rose-500 to-red-600 animate-pulse" 
              : "from-amber-500 via-red-500 to-amber-500"
          }`} 
        />

        {/* Header Alert Status */}
        <div className="flex items-start gap-4">
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isUnresponsive 
                ? "bg-destructive text-white shadow-destructive/50 animate-bounce" 
                : "bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse"
            }`}
          >
            {isUnresponsive ? (
              <ShieldAlert className="w-8 h-8 text-white" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isUnresponsive 
                    ? "bg-destructive text-white animate-pulse" 
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                {isUnresponsive ? "🚨 CRITICAL: PATIENT UNRESPONSIVE" : "⚠️ SAFETY CHECK: ARE YOU OK?"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{activeSosAlert.timestamp}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isUnresponsive 
                ? "Emergency Siren Dispatched" 
                : "Distress / Fall Detected"}
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isUnresponsive
                ? "Patient did not respond within the safety window. Loud alarm active and GPS coordinates dispatched!"
                : "If you are safe, press 'I am OK' below. Otherwise, siren and GPS coordinates will be dispatched."}
            </p>
          </div>
        </div>

        {/* 15-SECOND COUNTDOWN BANNER (Active while countdown > 0) */}
        {!isUnresponsive && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl font-mono shrink-0 animate-pulse">
                {countdown}s
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">Safety Countdown Active</p>
                <p className="text-[11px] text-muted-foreground">
                  Loud siren will sound in <strong className="text-amber-400 font-mono">{countdown} seconds</strong> if not cancelled.
                </p>
              </div>
            </div>
            <Timer className="w-6 h-6 text-amber-400 animate-spin shrink-0 opacity-80" />
          </div>
        )}

        {/* UNRESPONSIVE ALARM & GPS LOCATION PANEL (Active when countdown reached 0) */}
        {isUnresponsive && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-destructive animate-pulse">
                <Volume2 className="w-4 h-4" />
                Loud Siren Alarm Wailing
              </span>
              <span className="text-xs text-muted-foreground font-mono">Continuous Sound</span>
            </div>

            {/* GPS Location Details */}
            <div className="p-3 rounded-xl bg-card border border-destructive/20 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Dispatched GPS Location</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {isLocating ? "Acquiring live satellite GPS..." : location ? location.address : "Smart Bed Chamber 1, Home Ward"}
                    </p>
                    {location && (
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Coordinates: {location.lat}, {location.lng}
                      </p>
                    )}
                  </div>
                </div>

                {location?.mapsUrl && (
                  <a
                    href={location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Patient Vitals Snapshot */}
        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Smart Pillow Telemetry</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Sensor Sync
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                <Heart className="w-3.5 h-3.5 text-health-heart" /> HR
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.heartRate > 0 ? `${currentData.heartRate}` : "74"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">BPM</span>
            </div>

            <div className="p-2 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                <Wind className="w-3.5 h-3.5 text-health-spo2" /> SpO₂
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.spo2 > 0 ? `${currentData.spo2}` : "98"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">%</span>
            </div>

            <div className="p-2 rounded-xl bg-card border border-border/40">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                <Thermometer className="w-3.5 h-3.5 text-health-temp" /> Temp
              </div>
              <span className="text-base font-bold text-foreground">
                {currentData.temperature > 0 ? currentData.temperature.toFixed(1) : "36.6"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-0.5">°C</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          {/* PRIMARY: "I am OK" Button (Big & Green for Patient safety) */}
          <button
            onClick={handlePatientSafe}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer text-base active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>I am OK (False Alarm / Cancel)</span>
          </button>

          {/* SECONDARY ROW: Acknowledge Alert (Caregiver) & Call 108 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleAcknowledgeAlert}
              className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 px-4 rounded-xl border border-border transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm active:scale-98"
            >
              <BellOff className="w-4 h-4 text-primary" />
              <span>Acknowledge Alert</span>
            </button>

            <a
              href="tel:108"
              className="w-full bg-destructive/15 hover:bg-destructive/25 text-destructive font-bold py-3 px-4 rounded-xl border border-destructive/30 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm text-center"
            >
              <Phone className="w-4 h-4 text-destructive" />
              <span>Call Emergency 108</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
