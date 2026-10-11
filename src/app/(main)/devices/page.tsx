"use client";

import { Smartphone, Wifi, Battery, Cpu, Activity, RefreshCw } from "lucide-react";

export default function DevicesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Device Management</h1>
          <p className="text-muted-foreground mt-1">Manage your MedNest smart pillow hardware.</p>
        </div>
        <button className="p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <div className="glass-card rounded-2xl p-8 border border-border/50">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner border border-primary/20">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-foreground">Smart Pillow V1</h2>
              <span className="px-2.5 py-1 bg-health-good/10 text-health-good text-xs font-bold uppercase tracking-wider rounded-full border border-health-good/20">
                Connected
              </span>
            </div>
            <p className="text-muted-foreground font-mono">ID: MEDNEST-001</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Hardware Status</h3>
            
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-muted-foreground" />
                <span>ESP32 Core</span>
              </div>
              <span className="text-health-good text-sm font-medium">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <span>MAX30102 (HR/SpO₂)</span>
              </div>
              <span className="text-health-good text-sm font-medium">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <span>MPU6050 (Motion)</span>
              </div>
              <span className="text-health-good text-sm font-medium">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <span>FSR Sensors</span>
              </div>
              <span className="text-health-good text-sm font-medium">8/8 ONLINE</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Connectivity</h3>
            
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-primary" />
                <span>Network</span>
              </div>
              <span className="text-foreground text-sm font-medium">Home-WiFi-5G</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Battery className="w-5 h-5 text-health-good" />
                <span>Battery</span>
              </div>
              <span className="text-foreground text-sm font-medium">AC Power</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
                <span>Last Sync</span>
              </div>
              <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
