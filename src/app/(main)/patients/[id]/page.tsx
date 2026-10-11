"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Calendar, HeartPulse, Activity, AlertCircle, Edit2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function PatientProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { role } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Mock patient data for the prototype
  const patient = {
    id: id || "demo",
    name: "John Doe",
    age: 72,
    gender: "Male",
    bloodGroup: "O+",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Healing Way, Health City, CA 90210",
    emergencyContact: {
      name: "Sarah Guardian",
      relation: "Daughter",
      phone: "+1 987 654 3210"
    },
    medicalConditions: ["Hypertension", "Type 2 Diabetes", "Mild Arthritis"],
    allergies: ["Penicillin", "Peanuts"],
    currentMedicines: ["Lisinopril 10mg", "Metformin 500mg"],
    deviceId: "MEDNEST-001",
    joinDate: "2023-01-15"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        {role === 'guardian' && (
          <Link href="/patients" className="p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Profile</h1>
          <p className="text-muted-foreground mt-1">Detailed medical and personal information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Personal Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl mb-4">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
            <p className="text-muted-foreground mt-1">{patient.age} yrs • {patient.gender} • {patient.bloodGroup}</p>
            
            <div className="mt-6 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{patient.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Joined {new Date(patient.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              className="mt-6 w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-lg transition-colors"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-health-temp" />
              Emergency Contact
            </h3>
            <div className="bg-secondary/50 p-4 rounded-xl">
              <p className="font-medium text-foreground">{patient.emergencyContact.name}</p>
              <p className="text-sm text-muted-foreground mb-2">{patient.emergencyContact.relation}</p>
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <Phone className="w-4 h-4" />
                {patient.emergencyContact.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Medical Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Medical Overview
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Underlying Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalConditions.map((condition, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-health-temp/10 text-health-temp rounded-lg text-sm font-medium border border-health-temp/20">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Current Medications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.currentMedicines.map((med, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-health-spo2/10 text-health-spo2 rounded-lg text-sm font-medium border border-health-spo2/20 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4" />
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Device Management
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-health-good/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-health-good animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Smart Pillow Connected</h4>
                  <p className="text-sm text-muted-foreground font-mono">ID: {patient.deviceId}</p>
                </div>
              </div>
              <Link href="/devices" className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                Manage Device
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
