"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Activity, LayoutDashboard, Users, Monitor, 
  BarChart2, Pill, FileText, AlertTriangle, 
  Mic, Settings, Smartphone, Bell, X, LogOut,
  Download, Sparkles, UserCheck, HeartPulse
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { hapticFeedback } from "@/lib/haptics";
import { supabase } from "@/lib/supabase";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users, role: "guardian" },
  { name: "Live Monitor", href: "/monitoring", icon: Monitor },
  { name: "Health Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Medications", href: "/medications", icon: Pill },
  { name: "Medical Reports", href: "/reports", icon: FileText },
  { name: "Emergency", href: "/emergency", icon: AlertTriangle, isAlert: true },
  { name: "Voice Assistant", href: "/voice", icon: Mic },
  { name: "Devices", href: "/devices", icon: Smartphone },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isMobileDrawerOpen, 
    setMobileDrawerOpen, 
    role, 
    setRole, 
    user, 
    logout, 
    isStandalone, 
    setInstallModalOpen 
  } = useAuthStore();

  if (!isMobileDrawerOpen) return null;

  const closeDrawer = () => {
    hapticFeedback.light();
    setMobileDrawerOpen(false);
  };

  const toggleRole = () => {
    hapticFeedback.medium();
    const newRole = role === 'patient' ? 'guardian' : 'patient';
    setRole(newRole);
  };

  const handleLogout = async () => {
    hapticFeedback.medium();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    logout();
    closeDrawer();
    router.push("/");
  };

  const filteredNav = navItems.filter(item => !item.role || item.role === role);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <Activity className="text-primary w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-base text-foreground">MedNest</span>
              <span className="text-[10px] block font-semibold text-primary uppercase -mt-0.5">Companion</span>
            </div>
          </div>
          <button 
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="p-4 border-b border-border/60 bg-secondary/20">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Mode</p>
          <button
            onClick={toggleRole}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-xs font-semibold cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              {role === 'guardian' ? (
                <UserCheck className="w-4 h-4 text-primary" />
              ) : (
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-foreground capitalize">{role === 'guardian' ? 'Caregiver View' : 'Patient View'}</span>
            </div>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
              Tap to switch
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeDrawer}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "opacity-70"}`} />
                <span>{item.name}</span>
                {item.isAlert && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* Install App Quick Action in menu */}
          {!isStandalone && (
            <button
              onClick={() => {
                closeDrawer();
                setInstallModalOpen(true);
              }}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all text-left cursor-pointer border border-primary/20"
            >
              <Download className="w-4 h-4" />
              <span>Install Mobile App</span>
              <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-400" />
            </button>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-border mt-auto bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-health-spo2 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : (role === 'patient' ? 'JD' : 'SG')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || (role === 'patient' ? 'John Doe' : 'Caregiver')}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize truncate">{role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
