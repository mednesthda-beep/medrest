"use client";

import { useState } from "react";
import { User, Shield, Moon } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'appearance'>('account');
  const { user, isDemoMode, toggleDemoMode, theme, setTheme } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and system configurations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-3 font-medium rounded-xl transition-colors flex items-center gap-3 ${
              activeTab === 'account' 
                ? 'bg-secondary/80 text-foreground border border-border/50' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent'
            }`}
          >
            <User className="w-5 h-5" /> Account
          </button>
          
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-4 py-3 font-medium rounded-xl transition-colors flex items-center gap-3 ${
              activeTab === 'privacy' 
                ? 'bg-secondary/80 text-foreground border border-border/50' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent'
            }`}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-4 py-3 font-medium rounded-xl transition-colors flex items-center gap-3 ${
              activeTab === 'appearance' 
                ? 'bg-secondary/80 text-foreground border border-border/50' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent'
            }`}
          >
            <Moon className="w-5 h-5" /> Appearance
          </button>
        </div>

        <div className="md:col-span-3 glass-card rounded-2xl p-6 border border-border/50 min-h-[400px]">
          
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input type="text" defaultValue={user?.name || "John Doe"} className="w-full px-4 py-2.5 bg-input/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                  <input type="email" defaultValue={user?.email || "john.doe@example.com"} className="w-full px-4 py-2.5 bg-input/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <hr className="border-border/50" />
              
              <h2 className="text-xl font-bold mb-4">Threshold Configurations</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">High Heart Rate Alert</h4>
                    <p className="text-sm text-muted-foreground">Trigger alert if HR exceeds this value</p>
                  </div>
                  <input type="number" defaultValue={100} className="w-24 px-4 py-2 bg-input/50 border border-border rounded-xl text-foreground text-center" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Low SpO₂ Alert</h4>
                    <p className="text-sm text-muted-foreground">Trigger alert if SpO₂ drops below</p>
                  </div>
                  <input type="number" defaultValue={92} className="w-24 px-4 py-2 bg-input/50 border border-border rounded-xl text-foreground text-center" />
                </div>
              </div>
              
              <div className="pt-4">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-4">Privacy & Security</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div>
                    <h4 className="font-medium text-foreground">Share Data with Guardian</h4>
                    <p className="text-sm text-muted-foreground mt-1">Allow your assigned guardian to view live telemetry.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div>
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors">
                    Enable 2FA
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20 mt-8">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-destructive/80 mt-1">Permanently erase all health data.</p>
                  </div>
                  <button className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-destructive/20">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-4">Appearance Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <div>
                    <h4 className="font-medium text-foreground">Demo Mode</h4>
                    <p className="text-sm text-muted-foreground mt-1">Simulate UI states and system notifications without an ESP32.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isDemoMode} onChange={toggleDemoMode} />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Color Theme</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`border-2 rounded-xl p-4 text-left shadow-sm transition-all ${theme === 'dark' ? 'border-primary bg-background' : 'border-border/50 bg-secondary/50'}`}
                    >
                      <div className="flex gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-[#09090b]"></div>
                        <div className="w-4 h-4 rounded-full bg-[#2563eb]"></div>
                      </div>
                      <span className={`font-medium text-sm ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        MedNest Dark {theme === 'dark' && '(Active)'}
                      </span>
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`border-2 rounded-xl p-4 text-left shadow-sm transition-all ${theme === 'light' ? 'border-primary bg-background' : 'border-border/50 bg-secondary/50'}`}
                    >
                      <div className="flex gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-[#ffffff] border border-gray-300"></div>
                        <div className="w-4 h-4 rounded-full bg-[#2563eb]"></div>
                      </div>
                      <span className={`font-medium text-sm ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Light Mode {theme === 'light' && '(Active)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
