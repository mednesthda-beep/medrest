"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'patient' | 'guardian'>('patient');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-redirect if already logged in with an active session
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userRole = (session.user.user_metadata?.role as 'patient' | 'guardian') || 'patient';
          const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          setUser({ id: session.user.id, email: session.user.email, name: userName }, userRole);
          router.push("/dashboard");
        }
      } catch {
        // Continue to show login form
      }
    }
    checkExistingSession();
  }, [router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              role,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes("already registered")) {
            setError("An account with this email already exists. Please sign in instead.");
          } else {
            setError(signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // If role is patient, register initial record in patients table
          if (role === 'patient') {
            try {
              await supabase.from('patients').upsert({
                id: data.user.id,
                name: name.trim(),
                age: 68,
                gender: 'Unspecified',
                room_number: 'Smart Room 101',
                medical_condition: 'Cardiovascular Monitoring',
                guardian_contact: cleanEmail,
              });
            } catch {
              // Non-critical if table write fails
            }
          }

          if (data.session) {
            setUser(
              { id: data.user.id, email: data.user.email, name: name.trim() },
              role
            );
            router.push("/dashboard");
          } else {
            setSuccess("Account successfully created! You can now sign in.");
            setIsSignUp(false);
            setPassword("");
            setConfirmPassword("");
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In Flow - STRICT: Only registered users can authenticate
      setIsLoading(true);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) {
          setError("Access denied: Invalid credentials. Only users who have signed up can log in to this account.");
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userMeta = data.user.user_metadata;
          const userRole = (userMeta?.role as 'patient' | 'guardian') || role;
          const userName = userMeta?.name || cleanEmail.split('@')[0];

          setUser(
            { id: data.user.id, email: data.user.email, name: userName },
            userRole
          );
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Sign in failed. Please verify your connection.");
      } finally {
        setIsLoading(false);
      }
    }
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
            Smart Healthcare <br />
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
          <span>Encrypted Patient Privacy • Verified Access Only</span>
        </div>
      </div>

      {/* Right side: Login & Registration form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">MedNest</span>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-border/60">
            {/* Mode switch tabs */}
            <div className="flex rounded-xl bg-secondary/60 p-1 mb-6 border border-border/40">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isSignUp
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isSignUp
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isSignUp
                  ? "Register with your credentials to access your health dashboard"
                  : "Only verified registered accounts can log in"}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-destructive/15 border border-destructive/30 rounded-xl flex items-start gap-3 text-sm text-destructive animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="mb-5 p-3.5 bg-health-good/15 border border-health-good/30 rounded-xl flex items-start gap-3 text-sm text-health-good animate-in fade-in">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-health-good" />
                <div className="leading-snug">{success}</div>
              </div>
            )}

            {/* Account Role Selector */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                    role === 'patient'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setRole('patient')}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                    role === 'guardian'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setRole('guardian')}
                >
                  Guardian / Caregiver
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-input/40 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-input/40 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-input/40 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-input/40 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <span>{isSignUp ? "Create MedNest Account" : "Sign In to Account"}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
