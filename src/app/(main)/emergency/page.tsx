"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function EmergencyPage() {
  const { role } = useAuthStore();
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Emergency Alerts</h1>
        <p className="text-muted-foreground mt-1">Active alerts and emergency workflow.</p>
      </header>

      {/* Emergency Banner */}
      {!acknowledged ? (
        <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6 relative overflow-hidden animate-pulse">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-destructive/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="p-4 bg-destructive rounded-full shrink-0">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-destructive text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                Emergency Alert
              </div>
              <h2 className="text-2xl font-bold text-foreground">Possible Fall Detected</h2>
              <div className="mt-2 text-sm text-foreground/80 space-y-1">
                <p><strong>Patient:</strong> John Doe</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <div className="flex gap-4 mt-2 font-mono">
                  <span>HR: 142 BPM</span>
                  <span>SpO₂: 91%</span>
                  <span>Temp: 36.8°C</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={() => setAcknowledged(true)}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-destructive/20"
              >
                Acknowledge Alert
              </button>
              {role === 'patient' ? (
                <button 
                  onClick={() => setAcknowledged(true)}
                  className="bg-secondary hover:bg-secondary/80 text-foreground py-3 px-6 rounded-xl transition-colors font-medium border border-border"
                >
                  I&apos;m OK (Cancel)
                </button>
              ) : (
                <button className="bg-secondary hover:bg-secondary/80 text-foreground py-3 px-6 rounded-xl transition-colors font-medium border border-border flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Emergency Contact
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-health-good/10 border border-health-good/20 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-health-good mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground">System Normal</h2>
          <p className="text-muted-foreground mt-1">No active emergency alerts.</p>
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
