"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSensorStore } from '@/lib/sensors';

export function LiveChart() {
  const { history } = useSensorStore();

  // Format data for Recharts
  const data = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    heartRate: h.heartRate,
    spo2: h.spo2,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Waiting for sensor data...
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Line type="monotone" dataKey="heartRate" stroke="var(--health-heart)" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="spo2" stroke="var(--health-spo2)" strokeWidth={3} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
