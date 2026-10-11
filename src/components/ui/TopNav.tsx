"use client";

import { Bell, Search, Menu, LogOut, FileText, User as UserIcon, Activity } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function TopNav() {
  const { logout, isDemoMode, role } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">DEMO MODE ACTIVE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
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
            className="block w-64 pl-10 pr-3 py-1.5 bg-secondary border border-transparent rounded-full text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="Search patients, reports..."
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

        <Link href="/notifications" className="relative p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
        </Link>

        <button 
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
