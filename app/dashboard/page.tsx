"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDeviceMode } from "@/lib/device-mode-context";
import {
  Wallet,
  Activity,
  Compass,
  Target,
  ShieldCheck,
  Brain,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

interface AccountSummary {
  balance: number;
  income: number;
  expenses: number;
  healthScore: number;
  userName: string;
}

const SERVICES = [
  {
    num: "01",
    title: "Account & Activity",
    desc: "Cashflow & Balances",
    subdesc: "Track real-time balances, income flow, category expenses & recent transactions.",
    href: "/account",
    icon: Wallet,
    accent: "from-blue-500/10 to-indigo-500/5",
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/60",
    badge: "Cashflow",
  },
  {
    num: "02",
    title: "Financial Health",
    desc: "Diagnostic Score",
    subdesc: "Audit surplus margins, emergency reserves, expense ratios & AI health score.",
    href: "/financial-health",
    icon: Activity,
    accent: "from-purple-500/10 to-pink-500/5",
    iconBg: "bg-purple-50 text-purple-600 border-purple-200/60",
    badge: "Analysis",
  },
  {
    num: "03",
    title: "Smart Banking Guide",
    desc: "Decision Support",
    subdesc: "Interactive wizard to evaluate accounts, loan options, cards & investments.",
    href: "/guide",
    icon: Compass,
    accent: "from-teal-500/10 to-emerald-500/5",
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/60",
    badge: "Advisor",
  },
  {
    num: "04",
    title: "Financial Goals",
    desc: "Milestones & Plans",
    subdesc: "Set target savings amounts, calculate monthly contributions & track progress.",
    href: "/goals",
    icon: Target,
    accent: "from-emerald-500/10 to-teal-500/5",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    badge: "Savings",
  },
  {
    num: "05",
    title: "Digital Safety",
    desc: "Scam & Phishing Defense",
    subdesc: "AI fraud message detector, phishing quiz & safe digital banking practices.",
    href: "/safety",
    icon: ShieldCheck,
    accent: "from-rose-500/10 to-red-500/5",
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/60",
    badge: "Security",
  },
  {
    num: "06",
    title: "Kiosk AI",
    desc: "Financial Intelligence LLM",
    subdesc: "Conversational AI companion for banking insights, loans, investments & budget planning.",
    href: "/ai",
    icon: Sparkles,
    accent: "from-indigo-500/10 to-blue-500/5",
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    badge: "AI Powered",
  },
];

export default function DashboardPage() {
  const { mode } = useDeviceMode();
  const [summary, setSummary] = useState<AccountSummary>({
    balance: 142500,
    income: 85000,
    expenses: 52000,
    healthScore: 78,
    userName: "Aarav Sharma",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/account");
        const data = await res.json();
        if (data.success && data.user) {
          setSummary({
            balance: data.account?.balance || 142500,
            income: data.account?.monthlyIncome || 85000,
            expenses: data.account?.monthlyExpenses || 52000,
            healthScore: data.account?.healthScore || 78,
            userName: data.user?.name || "Aarav Sharma",
          });
        }
      } catch (e) {
        console.error("Dashboard account fetch failed:", e);
      }
    }
    loadData();
  }, []);

  const surplus = summary.income - summary.expenses;

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-slide-up pb-8">
      {/* Top Welcome Hero Banner */}
      <div className="bg-white border border-border/90 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

        <div className={`relative z-10 flex flex-col gap-5 ${mode === "kiosk" ? "lg:flex-row lg:items-center justify-between" : ""}`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 border border-blue-200/60 text-primary-blue">
                <Sparkles className="h-3 w-3" />
                Intelligent Hub
              </span>
              <span className="text-[11px] text-muted-text font-mono">
                SBK-001
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {summary.userName}
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text font-medium leading-relaxed">
              Explore your financial intelligence suite, run diagnostic audits, or ask Kiosk AI.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className={`grid gap-2.5 shrink-0 ${mode === "kiosk" ? "grid-cols-3" : "grid-cols-3 w-full"}`}>
            <div className="bg-slate-50/80 border border-slate-100 p-2.5 sm:p-3.5 rounded-xl flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-text uppercase tracking-wider">
                Balance
              </span>
              <span className="text-xs sm:text-base font-extrabold text-slate-900 mt-0.5 font-mono truncate">
                ₹{summary.balance.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-2.5 sm:p-3.5 rounded-xl flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-text uppercase tracking-wider">
                Surplus
              </span>
              <span className="text-xs sm:text-base font-extrabold text-emerald-600 mt-0.5 font-mono truncate">
                +₹{surplus.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-2.5 sm:p-3.5 rounded-xl flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-text uppercase tracking-wider">
                Health
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs sm:text-base font-extrabold text-indigo-600 font-mono">
                  {summary.healthScore}
                </span>
                <span className="text-[9px] text-muted-text font-medium">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div id="services" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Primary Financial Modules
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              6 Modules
            </span>
          </div>
          <span className="text-xs text-secondary-text font-semibold hidden sm:inline">
            Select a module to launch
          </span>
        </div>

        <div
          className={`grid gap-4 ${
            mode === "kiosk" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.title}
                href={srv.href}
                className="group relative flex flex-col justify-between p-6 bg-white border border-border rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Subtle gradient corner highlight */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${srv.accent} rounded-bl-full pointer-events-none transition-transform group-hover:scale-110`} />

                <div className="space-y-4 relative z-10">
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border shadow-2xs ${srv.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100/90 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                        {srv.badge}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary-blue group-hover:bg-blue-50 transition-all">
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {srv.num}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-primary-blue transition-colors tracking-tight">
                        {srv.title}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {srv.desc}
                    </p>
                    <p className="text-[11px] text-secondary-text leading-relaxed font-medium">
                      {srv.subdesc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-primary-blue transition-colors">
                  <span>Open Service</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Info Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight">
              Have questions about banking, finance, or anything else?
            </span>
            <span className="text-xs text-slate-300 font-medium mt-0.5">
              Kiosk AI is a general-purpose conversational LLM ready to help.
            </span>
          </div>
        </div>

        <Link
          href="/ai"
          className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
        >
          <span>Ask Kiosk AI</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
