"use client";

import { Pill, CheckCircle2, Clock, Plus } from "lucide-react";

export default function MedicationsPage() {
  const medications = [
    { id: 1, name: "Paracetamol", dosage: "500 mg", time: "08:00 AM", status: "taken", instructions: "After food" },
    { id: 2, name: "Metformin", dosage: "500 mg", time: "01:00 PM", status: "upcoming", instructions: "Before food" },
    { id: 3, name: "Lisinopril", dosage: "10 mg", time: "08:00 PM", status: "upcoming", instructions: "After food" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medications</h1>
          <p className="text-muted-foreground mt-1">Manage and track medication schedules.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </header>

      <div className="glass-card rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold mb-6">Today's Schedule</h2>
        
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  med.status === 'taken' ? 'bg-health-good/20 text-health-good' : 'bg-primary/20 text-primary'
                }`}>
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{med.name}</h3>
                  <p className="text-muted-foreground text-sm">{med.dosage} • {med.instructions}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                <div className="text-right">
                  <p className="font-bold text-foreground">{med.time}</p>
                </div>
                
                {med.status === 'taken' ? (
                  <div className="flex items-center gap-1.5 text-health-good bg-health-good/10 px-3 py-1.5 rounded-full text-sm font-medium border border-health-good/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Taken
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-500/20">
                    <Clock className="w-4 h-4" />
                    Upcoming
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
