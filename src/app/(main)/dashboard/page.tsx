"use client";

import { useEffect } from "react";
import { Activity, Heart, Thermometer, Wind, BedDouble, Pill, PersonStanding } from "lucide-react";
import { HealthCard } from "@/components/dashboard/HealthCard";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { PressureHeatmap } from "@/components/dashboard/PressureHeatmap";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentData, generateReading } = useSensorStore();

  useEffect(() => {
    // Fake interval removed as requested. Real data will be fetched or pushed via ESP32.
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">Here's the latest health summary from the smart pillow.</p>
        </div>
        <div className="flex items-center gap-2 bg-health-good/10 text-health-good px-4 py-2 rounded-full border border-health-good/20 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-health-good animate-pulse" />
          System Online & Monitoring
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard 
          title="Heart Rate" 
          value={currentData.heartRate} 
          unit="BPM" 
          icon={Heart} 
          colorClass="bg-health-heart text-health-heart" 
          trend="2%" 
          trendUp={false} 
          status={currentData.heartRate > 100 ? "High" : "Normal"}
        />
        <HealthCard 
          title="Blood Oxygen" 
          value={currentData.spo2} 
          unit="%" 
          icon={Wind} 
          colorClass="bg-health-spo2 text-health-spo2" 
          trend="1%" 
          trendUp={true} 
          status={currentData.spo2 < 95 ? "Low" : "Optimal"}
        />
        <HealthCard 
          title="Body Temperature" 
          value={currentData.temperature} 
          unit="°C" 
          icon={Thermometer} 
          colorClass="bg-health-temp text-health-temp" 
          status={currentData.temperature > 37.5 ? "Elevated" : "Normal"}
        />
        <HealthCard 
          title="Pillow Status" 
          value={currentData.patientPresent ? "Occupied" : "Empty"} 
          icon={BedDouble} 
          colorClass="bg-primary text-primary" 
          status={currentData.patientPresent ? "Active" : "Inactive"}
        />
        <HealthCard 
          title="Activity Level" 
          value={currentData.movement.x > 0.5 || currentData.movement.y > 0.5 ? "Restless" : "Normal"} 
          icon={PersonStanding} 
          colorClass="bg-purple-500 text-purple-500" 
          status="Stable"
        />
        <HealthCard 
          title="Medications" 
          value={2} 
          unit="upcoming" 
          icon={Pill} 
          colorClass="bg-orange-500 text-orange-500" 
          status="Next at 8:00 PM"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Real-Time Health Monitoring
            </h2>
          </div>
          <LiveChart />
        </div>
        
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary" />
              Pillow Pressure
            </h2>
          </div>
          <PressureHeatmap />
        </div>
      </div>
    </div>
  );
}
