"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { KioskLogo } from "@/components/kiosk-logo";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: Home, desc: "Main Dashboard" },
  { label: "Services", href: "/dashboard#services", icon: LayoutGrid, desc: "6 Financial Modules" },
  { label: "Kiosk AI", href: "/ai", icon: Sparkles, desc: "Financial Intelligence", badge: "Live" },
  { label: "Profile & QR", href: "/profile", icon: User, desc: "Account SB-849201" },
];

export function KioskSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    router.replace("/");
  };

  return (
    <aside className="w-68 border-r border-border bg-white flex flex-col justify-between shrink-0 shadow-[1px_0_12px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-18 px-6 border-b border-border/80 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white">
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <KioskLogo size="md" />
            <div className="flex flex-col">
              <span className="font-black text-[16px] tracking-tight text-slate-900 leading-tight">
                KIOSK
              </span>
              <span className="text-[9px] font-bold text-primary-blue uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Terminal K-01
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
              Navigation
            </span>
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href.split("#")[0] === pathname;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-primary-blue/10 group-hover:text-primary-blue"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="leading-tight">{item.label}</span>
                        <span
                          className={`text-[9.5px] font-normal leading-none mt-0.5 ${
                            isActive ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isActive
                            ? "bg-primary-blue text-white"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Security Badge Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-border/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                Secure Session Active
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5">
                Session automatically expires after inactivity.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Kiosk Button */}
      <div className="p-4 border-t border-border bg-slate-50/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="h-4 w-4 text-rose-500 transition-transform group-hover:-translate-x-0.5" />
            <span>End Kiosk Session</span>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </aside>
  );
}
