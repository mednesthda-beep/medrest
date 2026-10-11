"use client";

import { Activity, Heart, Wind, Thermometer, Info } from "lucide-react";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { PressureHeatmap } from "@/components/dashboard/PressureHeatmap";
import { useSensorStore } from "@/lib/sensors";

export default function MonitoringPage() {
  const { currentData, history } = useSensorStore();

  const getStats = (key: 'heartRate' | 'spo2' | 'temperature') => {
    if (history.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = history.map(h => h[key]);
    const validValues = values.filter(v => v > 0);
    if (validValues.length === 0) return { min: 0, max: 0, avg: 0 };
    
    return {
      min: Math.min(...validValues).toFixed(1),
      max: Math.max(...validValues).toFixed(1),
      avg: (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1)
    };
  };

  const hrStats = getStats('heartRate');
  const spo2Stats = getStats('spo2');
  const tempStats = getStats('temperature');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Monitor</h1>
          <p className="text-muted-foreground mt-1">Real-time telemetry from the smart pillow.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          Last updated: {new Date(currentData.timestamp).toLocaleTimeString()}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-health-heart" />
              Vital Trends
            </h2>
          </div>
          <LiveChart />
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary/50 p-4 rounded-xl text-center">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">HR Avg</p>
              <p className="text-xl font-bold text-foreground">{hrStats.avg} <span className="text-xs text-muted-foreground font-normal">bpm</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Min: {hrStats.min} | Max: {hrStats.max}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-xl text-center">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">SpO₂ Avg</p>
              <p className="text-xl font-bold text-foreground">{spo2Stats.avg} <span className="text-xs text-muted-foreground font-normal">%</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Min: {spo2Stats.min} | Max: {spo2Stats.max}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-xl text-center">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Temp Avg</p>
              <p className="text-xl font-bold text-foreground">{tempStats.avg} <span className="text-xs text-muted-foreground font-normal">°C</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Min: {tempStats.min} | Max: {tempStats.max}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 border border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              FSR Pressure Sensor (GPIO 34)
            </h2>
          </div>
          <div className="flex-1">
            <PressureHeatmap />
          </div>
          <div className="mt-6 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-sm">Status</span>
              <span className="font-bold text-primary">{currentData.patientPresent ? "Patient Present" : "No Pressure"}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-sm">Movement</span>
              <span className="font-bold text-foreground">
                {currentData.movement.x > 0.5 ? "High" : currentData.movement.x > 0.2 ? "Moderate" : "Low"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
