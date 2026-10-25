"use client";

import { Bell, Search, Menu, LogOut, FileText, User as UserIcon, Activity, Download, HeartPulse, UserCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { hapticFeedback } from "@/lib/haptics";

export function TopNav() {
  const { 
    logout, 
    isDemoMode, 
    role, 
    setRole, 
    toggleMobileDrawer, 
    isStandalone, 
    setInstallModalOpen 
  } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Quick mock search database
  const searchDatabase = [
    { title: "John Doe's Profile", type: "patient", icon: UserIcon, href: role === 'patient' ? "/patients/me" : "/patients/demo-patient" },
    { title: "Health Analytics", type: "page", icon: Activity, href: "/analytics" },
    { title: "Live Monitor", type: "page", icon: Activity, href: "/monitoring" },
    { title: "Medications Schedule", type: "page", icon: FileText, href: "/medications" },
    { title: "Medical Reports (OCR)", type: "page", icon: FileText, href: "/reports" },
  ];

  const searchResults = searchDatabase.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    hapticFeedback.medium();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on sign out
    }
    logout();
    router.push("/");
  };

  const toggleRole = () => {
    hapticFeedback.medium();
    setRole(role === 'patient' ? 'guardian' : 'patient');
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-3 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button 
          onClick={() => {
            hapticFeedback.light();
            toggleMobileDrawer();
          }}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand mark on mobile */}
        <div className="flex md:hidden items-center gap-1.5">
          <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center">
            <Activity className="text-primary w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-sm text-foreground">MedNest</span>
        </div>

        {/* Role Quick Toggle Pill */}
        <button
          onClick={toggleRole}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary border border-border text-xs font-medium text-foreground transition-all cursor-pointer"
          title="Click to toggle between Caregiver and Patient mode"
        >
          {role === 'guardian' ? (
            <UserCheck className="w-3.5 h-3.5 text-primary" />
          ) : (
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="capitalize">{role === 'guardian' ? 'Caregiver Mode' : 'Patient Mode'}</span>
        </button>

        {isDemoMode && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-semibold text-primary">LIVE ESP32</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar on Desktop */}
        <div className="hidden md:flex relative group" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="block w-56 lg:w-64 pl-10 pr-3 py-1.5 bg-secondary border border-transparent rounded-full text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="Search vitals, reports..."
          />
          
          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              {searchResults.length > 0 ? (
                searchResults.map((result, idx) => (
                  <Link 
                    key={idx}
                    href={result.href}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors"
                  >
                    <result.icon className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{result.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{result.type}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Install Mobile App Button */}
        {!isStandalone && (
          <button
            onClick={() => {
              hapticFeedback.medium();
              setInstallModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-all cursor-pointer"
            title="Install MedNest Companion App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Notifications Icon */}
        <Link 
          href="/notifications" 
          onClick={() => hapticFeedback.light()}
          className="relative p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
        </Link>

        {/* Sign Out Button */}
        <button 
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
