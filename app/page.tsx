"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Activity, Wallet } from "lucide-react";
import { KioskLogo } from "@/components/kiosk-logo";

export default function SplashPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 relative overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/20 via-indigo-200/15 to-emerald-200/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Brand Pill */}
      <div className="mb-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-border shadow-xs text-xs font-bold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Next-Gen Self-Service Banking Terminal</span>
        <span className="text-muted-text">•</span>
        <span className="text-primary-blue font-black font-mono text-[11px]">KIOSK v2.4</span>
      </div>

      <div className="max-w-xl w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-border/90 p-8 sm:p-12 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        <div className="text-center relative z-10">
          {/* KIOSK Logo icon */}
          <div className="flex justify-center mb-6">
            <KioskLogo size="xl" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
            KIOSK
          </h1>
          <p className="text-xs font-bold text-primary-blue uppercase tracking-widest mb-4">
            Interactive Financial Intelligence & Literacy Terminal
          </p>

          <p className="text-sm text-secondary-text max-w-md mx-auto mb-8 leading-relaxed font-medium">
            Understand your cashflow, simulate financial goals, audit your health score, detect digital fraud, and chat with the Kiosk AI companion.
          </p>

          {/* Interactive Feature Matrix Pills */}
          <div className="grid grid-cols-3 gap-2.5 mb-8 text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Accounts</span>
                <span className="text-[9px] text-slate-400">Cashflow & Balances</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-100/70 text-purple-700">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Health Score</span>
                <span className="text-[9px] text-slate-400">Surplus & Ratios</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Kiosk AI</span>
                <span className="text-[9px] text-slate-400">General LLM</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] cursor-pointer text-sm tracking-wide group"
            >
              <span>ACCESS KIOSK TERMINAL</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-blue-400" />
            </Link>

            <div className="pt-6 border-t border-border/80 flex items-center justify-between text-xs text-secondary-text">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-600">Self-Service Banking Terminal</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Terminal SBK-01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
