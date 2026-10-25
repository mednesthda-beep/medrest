"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, Mic, Pill, AlertTriangle } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Vitals",
      href: "/monitoring",
      icon: Activity,
    },
    {
      name: "Voice AI",
      href: "/voice",
      icon: Mic,
      isPrimaryAction: true,
    },
    {
      name: "Meds",
      href: "/medications",
      icon: Pill,
    },
    {
      name: "SOS",
      href: "/emergency",
      icon: AlertTriangle,
      isEmergency: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-xl border-t border-border px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isPrimaryAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => hapticFeedback.medium()}
                className="relative -top-4 flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-tr from-primary to-sky-400 text-white shadow-primary/40 ring-4 ring-background"
                    : "bg-primary text-white shadow-primary/30 ring-4 ring-background"
                }`}>
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          if (item.isEmergency) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => hapticFeedback.alarm()}
                className="flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? "text-destructive" : "text-destructive/80"
                  }`} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors ${
                  isActive ? "text-destructive" : "text-destructive/80"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => hapticFeedback.light()}
              className="flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] mt-1 transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
