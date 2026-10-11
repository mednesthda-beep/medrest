"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, User } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [role, setRole] = useState<'patient' | 'guardian'>('patient');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDemo, setIsDemo] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for prototype/demo
    setUser({ id: "demo-user", email, name: role === 'patient' ? "John Doe" : "Sarah Guardian" }, role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-card border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-health-heart/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">MedNest</span>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Smart Healthcare <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-health-spo2">
              Monitoring Platform
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            AI-powered smart pillow connected system for real-time patient monitoring, emergency detection, and actionable health insights.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-health-good" />
          <span>Prototype version • Secure access</span>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">MedNest</span>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  role === 'patient' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setRole('patient')}
              >
                Patient
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  role === 'guardian' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setRole('guardian')}
              >
                Guardian
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-input/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-muted-foreground">Password</label>
                  <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-input/50 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="demo-mode"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="rounded border-border bg-input text-primary focus:ring-primary"
                />
                <label htmlFor="demo-mode" className="text-sm text-muted-foreground">
                  Enable Demo Mode (Simulated Data)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] mt-6"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account? <a href="#" className="text-primary hover:underline">Register here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
