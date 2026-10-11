"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopNav } from "@/components/ui/TopNav";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, theme } = useAuthStore();
  const { updateRealData } = useSensorStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Real-time synchronization with ESP32 sensor endpoint
  useEffect(() => {
    let active = true;
    const pollSensorData = async () => {
      try {
        const res = await fetch('/api/sensor-data');
        if (res.ok) {
          const json = await res.json();
          if (active && json.currentData && (json.currentData.timestamp || json.currentData.temperature > 0 || json.currentData.heartRate > 0)) {
            updateRealData(json.currentData);
          }
        }
      } catch (err) {
        // Ignore fetch errors during navigation or idle
      }
    };

    pollSensorData();
    const intervalId = setInterval(pollSensorData, 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [updateRealData]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
