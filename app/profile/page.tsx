"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, LogOut, ShieldCheck, CheckCircle2, QrCode, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Aarav Sharma");
  const [customerId, setCustomerId] = useState("SBK001");
  const [balance, setBalance] = useState(25430);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/account");
        const json = await res.json();
        if (json.success && json.user) {
          setUserName(json.user.name || "Aarav Sharma");
          setCustomerId(json.user.customerId || "SBK001");
          setBalance(json.user.balance || 25430);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    router.replace("/");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2.5 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Account Profile & Terminal Settings
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
              Session SBK-001
            </span>
          </div>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            Manage your authenticated banking identity and terminal preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="bg-white border border-border/90 p-6 rounded-2xl shadow-xs space-y-5 md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs">
              {userName.charAt(0)}
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">{userName}</h2>
              <p className="text-xs text-secondary-text font-medium mt-0.5">
                Customer ID: <span className="font-mono font-bold text-slate-800">{customerId}</span> • Primary Savings Account
              </p>
            </div>
          </div>

          <div className="border-t border-border/70 pt-4 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-semibold py-1">
              <span className="text-slate-500">Account Status:</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                KYC VERIFIED & ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold py-1">
              <span className="text-slate-500">Linked Account Balance:</span>
              <span className="font-black text-slate-900 font-mono text-sm">₹{balance.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold py-1">
              <span className="text-slate-500">Terminal Location:</span>
              <span className="text-slate-800 font-bold">Kiosk Terminal 001 (Main Branch)</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold py-1">
              <span className="text-slate-500">Security Encryption:</span>
              <span className="text-slate-800 font-mono text-[11px] font-bold">256-Bit TLS End-to-End</span>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="bg-white border border-border/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Terminal Security
            </h3>
            
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-700 font-medium leading-relaxed">
                Self-service PIN & session token protection active for this terminal.
              </span>
            </div>

            <Link
              href="/qr"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 text-primary-blue text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <QrCode className="h-4 w-4" />
              <span>Sync to Mobile Device</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="h-4 w-4" />
            <span>End Kiosk Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
