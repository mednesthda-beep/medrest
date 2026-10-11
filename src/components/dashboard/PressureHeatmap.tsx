"use client";

import { useSensorStore } from '@/lib/sensors';
import { Activity } from 'lucide-react';

export function PressureHeatmap() {
  const { currentData } = useSensorStore();
  const fsr = currentData.pressure?.fsr1 ?? 0;

  // ESP32 12-bit ADC runs 0 to 4095
  const percentage = Math.min(100, Math.max(0, Math.round((fsr / 4095) * 100)));

  const getPressureStatus = (val: number) => {
    if (val < 150) {
      return {
        label: 'No Contact (Empty)',
        badgeClass: 'bg-secondary text-muted-foreground border-border',
        glowColor: 'rgba(100, 116, 139, 0.1)',
        ringColor: 'border-border/40'
      };
    }
    if (val < 800) {
      return {
        label: 'Light Pressure',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        glowColor: 'rgba(59, 130, 246, 0.25)',
        ringColor: 'border-blue-500/50'
      };
    }
    if (val < 2500) {
      return {
        label: 'Optimal Patient Contact',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        ringColor: 'border-emerald-500/60'
      };
    }
    return {
      label: 'High Pressure / Firm',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      ringColor: 'border-amber-500/60'
    };
  };

  const status = getPressureStatus(fsr);

  return (
    <div className="h-64 w-full flex flex-col justify-between">
      {/* Sensor Info Header */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40">
        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
          <Activity className="w-3.5 h-3.5 text-primary" />
          FSR Sensor (GPIO 34)
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      {/* Center Interactive Pillow Pressure Visualization */}
      <div className="flex-1 flex items-center justify-center relative py-2">
        {/* Pillow Outline */}
        <div 
          className="w-full max-w-[260px] h-32 rounded-3xl border-2 border-dashed border-border/60 flex items-center justify-center relative overflow-hidden bg-secondary/20 transition-all duration-500"
          style={{
            boxShadow: `0 0 25px ${status.glowColor}`
          }}
        >
          {/* Pressure Ripple Circle */}
          <div 
            className="rounded-full transition-all duration-700 flex items-center justify-center"
            style={{
              width: `${Math.max(50, percentage * 2)}px`,
              height: `${Math.max(50, percentage * 1.5)}px`,
              backgroundColor: status.glowColor,
              boxShadow: `0 0 30px ${status.glowColor}`,
              border: `2px solid ${status.ringColor}`
            }}
          >
            <div className="text-center">
              <span className="text-xl font-bold text-foreground block leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {fsr} ADC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scale */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0 ADC (Resting)</span>
          <span>4095 ADC (Max)</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(3, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
