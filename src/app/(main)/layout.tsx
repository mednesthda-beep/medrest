"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopNav } from "@/components/ui/TopNav";
import { useAuthStore } from "@/lib/store";
import { useSensorStore } from "@/lib/sensors";
import { supabase } from "@/lib/supabase";
import { Activity } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, setUser, theme } = useAuthStore();
  const { updateRealData } = useSensorStore();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(!isAuthenticated);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (isAuthenticated) {
        if (isMounted) setIsVerifying(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = (session.user.user_metadata?.role as 'patient' | 'guardian') || 'patient';
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          setUser({ id: session.user.id, email: session.user.email, name }, role);
          if (isMounted) setIsVerifying(false);
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setUser, router]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Real-time synchronization with ESP32 sensor endpoint
  useEffect(() => {
    if (!isAuthenticated && isVerifying) return;

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
      } catch {
        // Ignore fetch errors during navigation or idle
      }
    };

    pollSensorData();
    const intervalId = setInterval(pollSensorData, 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [updateRealData, isAuthenticated, isVerifying]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="text-primary w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Verifying MedNest security session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
