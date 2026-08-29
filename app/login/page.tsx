"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, User, ShieldCheck, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { KioskLogo } from "@/components/kiosk-logo";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("SBK001");
  const [pin, setPin] = useState("1234");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userName = name.trim() || "Aarav Sharma";

    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId.trim().toUpperCase(),
          pin: pin.trim(),
          name: userName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setConfirmedName(json.user.name);
        setIsVerifying(false);
        setSuccess(true);
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1000);
      } else {
        throw new Error(json.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setIsVerifying(false);
      setError(err.message || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 relative">
      <div className="max-w-md w-full bg-white rounded-3xl border border-border/90 p-8 sm:p-10 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        {/* Subtle accent header line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        <Link
          href="/"
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="text-center mb-8 mt-2">
          <div className="flex justify-center mb-4">
            <KioskLogo size="lg" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            KIOSK Terminal Login
          </h2>
          <p className="text-xs text-secondary-text mt-1 font-medium">
            Sign in to start your personalized banking session
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in space-y-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Session Verified</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Welcome, {confirmedName}!
              </h3>
              <p className="text-xs text-secondary-text mt-1 font-medium">
                Opening your financial dashboard...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Enter Your Name field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Account Holder Name</span>
                <span className="text-[10px] text-primary-blue font-semibold lowercase">
                  (auto-personalized)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 kiosk-input font-bold text-sm bg-slate-50/50"
                  placeholder="e.g. Aarav Sharma"
                  autoFocus
                />
              </div>
            </div>

            {/* Customer ID & PIN Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-11 px-3.5 kiosk-input font-mono font-bold text-center text-xs uppercase tracking-wider bg-slate-50/50"
                  placeholder="SBK001"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>PIN</span>
                </label>
                <input
                  type="password"
                  value={pin}
                  maxLength={4}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-11 px-3.5 kiosk-input font-mono font-bold text-center text-sm tracking-[0.25em] bg-slate-50/50"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2 text-xs uppercase tracking-wider"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>ACCESS TERMINAL</span>
              )}
            </button>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] text-slate-500 font-medium">
                Default Demo: <strong>SBK001</strong> / PIN: <strong>1234</strong>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
