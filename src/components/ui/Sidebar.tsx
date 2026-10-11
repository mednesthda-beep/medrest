"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, LayoutDashboard, Users, Monitor, 
  BarChart2, Pill, FileText, AlertTriangle, 
  Mic, Settings, Smartphone, Bell
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users, role: "guardian" },
  { name: "Live Monitor", href: "/monitoring", icon: Monitor },
  { name: "Health Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Medications", href: "/medications", icon: Pill },
  { name: "Medical Reports", href: "/reports", icon: FileText },
  { name: "Emergency", href: "/emergency", icon: AlertTriangle },
  { name: "Voice Assistant", href: "/voice", icon: Mic },
  { name: "Devices", href: "/devices", icon: Smartphone },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuthStore();

  const filteredNav = navItems.filter(item => !item.role || item.role === role);

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Activity className="text-primary w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground">MedNest</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "opacity-70"}`} />
              <span className="font-medium text-sm">{item.name}</span>
              {item.name === "Emergency" && (
                <div className="ml-auto w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border mt-auto">
        <Link 
          href={`/patients/${role === 'patient' ? 'me' : 'guardian'}`} 
          className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border/50 hover:bg-secondary transition-colors cursor-pointer block"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-health-spo2 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            {role === 'patient' ? 'JD' : 'SG'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">
              {role === 'patient' ? 'John Doe' : 'Sarah Guardian'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
