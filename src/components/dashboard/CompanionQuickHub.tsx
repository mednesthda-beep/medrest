"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { hapticFeedback } from "@/lib/haptics";
import { sendLocalNotification, requestNotificationPermission } from "@/lib/notifications";
import { 
  BedDouble, Mic, Bell, UserCheck, 
  HeartPulse, CheckCircle2, ChevronRight 
} from "lucide-react";
import Link from "next/link";

export function CompanionQuickHub() {
  const { role, setRole } = useAuthStore();
  const { currentData } = useSensorStore();
  const [notificationSent, setNotificationSent] = useState(false);

  const toggleRole = () => {
    hapticFeedback.medium();
    setRole(role === 'patient' ? 'guardian' : 'patient');
  };

  const handleTestNotification = async () => {
    hapticFeedback.medium();
    const granted = await requestNotificationPermission();
    if (granted) {
      await sendLocalNotification("🚨 MedNest Vitals Normal", {
        body: `Heart Rate: ${currentData.heartRate || 72} BPM, SpO2: ${currentData.spo2 || 98}%, Bed: ${currentData.patientPresent ? 'Occupied' : 'Vacant'}.`,
        tag: 'test-telemetry',
        url: '/monitoring',
      });
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    } else {
      alert("Please allow notification permissions in your browser to receive mobile alarms.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/10 border border-primary/20 p-4 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Background Ambient Glow */}
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Bed Status & Companion Mode Indicator */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
            currentData.patientPresent
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-amber-500/20 border-amber-500/40 text-amber-400"
          }`}>
            <BedDouble className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-foreground">
                {currentData.patientPresent ? "Patient Resting on Smart Pillow" : "Smart Pillow Unoccupied"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                currentData.patientPresent
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {currentData.patientPresent ? "Present" : "Vacant"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>Telemetry: 1s Interval (ESP32)</span>
              <span>•</span>
              <span className="text-primary font-medium capitalize">{role === 'guardian' ? 'Caregiver Oversight Active' : 'Patient Companion Active'}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Mode Switcher */}
          <button
            onClick={toggleRole}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm"
          >
            {role === 'guardian' ? (
              <UserCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Switch to {role === 'guardian' ? 'Patient' : 'Caregiver'}</span>
          </button>

          {/* Test Push Notification */}
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm"
            title="Send test alarm to your device"
          >
            {notificationSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Sent to Phone</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Alarm</span>
              </>
            )}
          </button>

          {/* Quick Voice Assistant Trigger */}
          <Link
            href="/voice"
            onClick={() => hapticFeedback.medium()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/30 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice AI</span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}
