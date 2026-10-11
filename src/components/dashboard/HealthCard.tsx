"use client";

import { LucideIcon } from "lucide-react";

interface HealthCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  colorClass: string;
  trend?: string;
  trendUp?: boolean;
  status?: string;
}

export function HealthCard({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  trend,
  trendUp,
  status
}: HealthCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-transform group-hover:scale-150 ${colorClass}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-secondary border border-border/50">
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {status && (
          <span className="px-2.5 py-1 rounded-full bg-secondary/80 text-xs font-medium text-muted-foreground border border-border/50">
            {status}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-muted-foreground font-medium text-sm mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
          {unit && <span className="text-muted-foreground font-medium">{unit}</span>}
        </div>
        
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-sm">
            <span className={trendUp ? "text-health-good" : "text-health-heart"}>
              {trendUp ? "↑" : "↓"} {trend}
            </span>
            <span className="text-muted-foreground text-xs">vs last hour</span>
          </div>
        )}
      </div>
    </div>
  );
}
