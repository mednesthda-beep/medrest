"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Calendar, Moon, Brain, ChevronDown } from "lucide-react";

export default function AnalyticsPage() {
  // Mock data for analytics
  const weeklySleepData = [
    { day: 'Mon', hours: 7.2 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 5.9 },
    { day: 'Fri', hours: 8.1 },
    { day: 'Sat', hours: 8.5 },
    { day: 'Sun', hours: 7.9 },
  ];

  const activityData = [
    { time: '12am', level: 10 },
    { time: '4am', level: 5 },
    { time: '8am', level: 80 },
    { time: '12pm', level: 60 },
    { time: '4pm', level: 70 },
    { time: '8pm', level: 40 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights based on historical sensor data.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border/50 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 Days
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl p-[1px]">
        <div className="bg-card rounded-2xl p-6 h-full w-full">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-500 rounded-xl shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">AI Health Insight</h3>
              <p className="text-muted-foreground leading-relaxed">
                Activity level has decreased compared with the previous monitoring period. Sleep duration is stable, but restlessness was detected between 2 AM and 4 AM last night.
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground border border-border/50">Pattern: Decreased Activity</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground border border-border/50">Pattern: Night Restlessness</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Duration */}
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Sleep Duration
            </h2>
            <span className="text-2xl font-bold text-indigo-400">7.4h <span className="text-sm font-normal text-muted-foreground">avg</span></span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySleepData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'var(--secondary)'}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="hours" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-health-good" />
              Movement / Activity
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--health-good)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--health-good)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="level" stroke="var(--health-good)" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
