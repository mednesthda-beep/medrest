"use client";

import { Bell, AlertTriangle, Pill, Smartphone, Activity, Info, CheckCircle2 } from "lucide-react";
import { useState } from "react";

type NotificationType = 'emergency' | 'medication' | 'device' | 'sensor' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "emergency",
      title: "Possible Fall Detected",
      description: "Sudden movement change detected. Patient was unresponsive for 30s.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      severity: "high",
      read: false
    },
    {
      id: "2",
      type: "sensor",
      title: "High Heart Rate Alert",
      description: "Heart rate exceeded 100 BPM for over 5 minutes.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      severity: "medium",
      read: false
    },
    {
      id: "3",
      type: "medication",
      title: "Medication Reminder",
      description: "Time to take Metformin 500mg.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      severity: "medium",
      read: true
    },
    {
      id: "4",
      type: "device",
      title: "Device Offline",
      description: "Smart Pillow MEDNEST-001 disconnected from WiFi.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      severity: "high",
      read: true
    },
    {
      id: "5",
      type: "system",
      title: "System Update",
      description: "MedNest software has been updated to v1.2.0.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      severity: "low",
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medication': return <Pill className="w-5 h-5 text-orange-500" />;
      case 'device': return <Smartphone className="w-5 h-5 text-primary" />;
      case 'sensor': return <Activity className="w-5 h-5 text-health-temp" />;
      case 'system': return <Info className="w-5 h-5 text-health-spo2" />;
    }
  };

  const getSeverityStyle = (severity: string, read: boolean) => {
    if (read) return "bg-secondary/30 border-border/50 opacity-70";
    
    switch (severity) {
      case 'high': return "bg-destructive/10 border-destructive/30";
      case 'medium': return "bg-orange-500/10 border-orange-500/30";
      case 'low': return "bg-primary/10 border-primary/30";
      default: return "bg-secondary/50 border-border";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notification Center
          </h1>
          <p className="text-muted-foreground mt-1">View alerts and system messages.</p>
        </div>
        
        <button 
          onClick={markAllRead}
          className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border/50 flex items-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </header>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-2xl border transition-all ${getSeverityStyle(notification.severity, notification.read)}`}
          >
            <div className={`p-3 rounded-xl shrink-0 mt-1 ${notification.read ? 'bg-secondary' : 'bg-background shadow-sm'}`}>
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <h3 className={`font-bold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
              <p className={`text-sm ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                {notification.description}
              </p>
            </div>
            
            {!notification.read && (
              <div className="w-3 h-3 bg-primary rounded-full shrink-0 mt-2 sm:mt-2.5 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
