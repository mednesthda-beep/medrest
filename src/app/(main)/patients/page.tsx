"use client";

import { Search, Plus, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function PatientsPage() {
  const { role } = useAuthStore();
  
  if (role !== 'guardian') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Only guardians can access patient management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Patients</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your connected patients.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </header>

      <div className="glass-card rounded-2xl p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-input/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="Search patients by name or ID..."
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="bg-input/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
              <option>All Statuses</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Alert</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="pb-3 font-medium px-4">Patient</th>
                <th className="pb-3 font-medium px-4">Device ID</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4">Last Sync</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-foreground">John Doe</p>
                      <p className="text-xs text-muted-foreground">72 yrs • Male</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm font-mono text-muted-foreground">MEDNEST-001</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-health-good/10 text-health-good text-xs font-medium border border-health-good/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-health-good animate-pulse"></span>
                    Online
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">Just now</td>
                <td className="py-4 px-4 text-right">
                  <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-secondary/20 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold">
                      MS
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Mary Smith</p>
                      <p className="text-xs text-muted-foreground">68 yrs • Female</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm font-mono text-muted-foreground">MEDNEST-042</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                    Offline
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">2 hours ago</td>
                <td className="py-4 px-4 text-right">
                  <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
