"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { hapticFeedback } from "@/lib/haptics";
import { sendLocalNotification, requestNotificationPermission } from "@/lib/notifications";
import { 
  BedDouble, Mic, Bell, UserCheck, 
  HeartPulse, CheckCircle2, ChevronRight, Usb, Sparkles, AlertTriangle 
} from "lucide-react";
import Link from "next/link";

export function CompanionQuickHub() {
  const { role, setRole, triggerEmergencySos } = useAuthStore();
  const { currentData, updateRealData, generateReading } = useSensorStore();
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Live simulation ticker
  useEffect(() => {
    if (!isSimulating) return;
    generateReading();
    const interval = setInterval(() => {
      generateReading();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulating, generateReading]);

  const toggleSimulation = () => {
    hapticFeedback.light();
    setIsSimulating((prev) => !prev);
  };

  const connectUsbSerial = async () => {
    hapticFeedback.medium();
    if (typeof window === "undefined" || !("serial" in navigator)) {
      alert("Direct USB Serial requires Google Chrome, Edge, or Opera.\n\nTip: You can also click 'Simulate Vitals' to stream real-time demo vitals directly!");
      return;
    }

    try {
      // Prompt user to select ESP32 USB port
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      setIsSerialConnected(true);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let buffer = "";
      let temp = 33.38;
      let hr = 0;
      let spo2 = 0;
      let fsr = 0;
      let present = false;
      let ax = 0, ay = 0, az = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const fsrM = line.match(/FSR Pressure:\s+(\d+)/i);
          if (fsrM) {
            fsr = parseInt(fsrM[1], 10);
            present = fsr > 100 || line.includes("PRESENT");
          }

          const tempM = line.match(/Temperature:\s+([\d.]+)/i);
          if (tempM) temp = parseFloat(tempM[1]);

          const hrM = line.match(/Heart Rate:\s+([\d.]+)/i);
          if (hrM) hr = parseFloat(hrM[1]);

          const spo2M = line.match(/Blood Oxygen:\s+([\d.]+)/i);
          if (spo2M) spo2 = parseFloat(spo2M[1]);

          const accelM = line.match(/Accel\s*\(X,Y,Z\):\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)/i);
          if (accelM) {
            ax = parseFloat(accelM[1]);
            ay = parseFloat(accelM[2]);
            az = parseFloat(accelM[3]);
          }

          if (line.includes("--- [MedNest Sensor Reading] ---") || line.includes("[HTTP]")) {
            const telemetry = {
              heartRate: hr,
              spo2: spo2,
              temperature: temp,
              movement: { x: ax, y: ay, z: az },
              pressure: { fsr1: fsr },
              patientPresent: present,
              timestamp: new Date().toISOString(),
            };
            updateRealData(telemetry);
            fetch("/api/sensor-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(telemetry),
            }).catch(() => {});
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        alert(
          `Serial Port Notice: If Arduino IDE Serial Monitor is currently open, close it first so the browser can access the USB port.\n\nError: ${err.message}`
        );
      }
      setIsSerialConnected(false);
    }
  };

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
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                {isSerialConnected
                  ? "🟢 ESP32 USB Direct Connected"
                  : isSimulating
                  ? "✨ Live Simulator Streaming"
                  : "Telemetry: 1s Interval (ESP32)"}
              </span>
              <span>•</span>
              <span className="text-primary font-medium capitalize">{role === 'guardian' ? 'Caregiver Oversight Active' : 'Patient Companion Active'}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Direct USB Serial Connection */}
          <button
            onClick={connectUsbSerial}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              isSerialConnected
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-secondary/80 hover:bg-secondary border-border text-foreground"
            }`}
            title="Read live sensor readings directly from ESP32 USB cable (No Wi-Fi needed!)"
          >
            <Usb className="w-3.5 h-3.5 text-primary" />
            <span>{isSerialConnected ? "USB Active" : "Connect ESP32 (USB)"}</span>
          </button>

          {/* Simulator Toggle */}
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              isSimulating
                ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                : "bg-secondary/80 hover:bg-secondary border-border text-foreground"
            }`}
            title="Toggle live vital signs simulation directly in dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isSimulating ? "Simulating" : "Simulate Vitals"}</span>
          </button>

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
            <span>{role === 'guardian' ? 'Patient Mode' : 'Caregiver Mode'}</span>
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
                <span className="text-emerald-400">Alarm Sent</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Alarm</span>
              </>
            )}
          </button>

          {/* Emergency SOS Trigger */}
          <button
            onClick={() => {
              triggerEmergencySos(
                "🚨 CRITICAL SOS ALERT",
                "Patient distress triggered from Companion Quick Hub. Vitals monitoring active."
              );
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-destructive/25 animate-pulse"
            title="Trigger Full Emergency SOS Popup & Siren"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Emergency SOS</span>
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
