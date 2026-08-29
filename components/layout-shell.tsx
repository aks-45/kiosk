"use client";

import React, { useState, useEffect } from "react";
import { useDeviceMode } from "@/lib/device-mode-context";
import { KioskSidebar } from "@/components/navigation/kiosk-sidebar";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { KioskLogo } from "@/components/kiosk-logo";
import { PageTransitionLoader } from "@/components/page-transition-loader";
import { usePathname } from "next/navigation";
import { QrCode, Smartphone, Monitor } from "lucide-react";
import Link from "next/link";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const { mode, setMode } = useDeviceMode();
  const pathname = usePathname();
  const [userName, setUserName] = useState("Aarav Sharma");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/account");
        const data = await res.json();
        if (data.success && data.user?.name) {
          setUserName(data.user.name);
        }
      } catch (e) {
        // keep default
      }
    }
    if (pathname !== "/" && pathname !== "/login") {
      fetchUser();
    }
  }, [pathname]);

  // Hide shells on Splash (/) and Login (/login) routes
  const isAuthPage = pathname === "/" || pathname === "/login";

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background selection:bg-primary-blue/10 selection:text-primary-blue">
        <PageTransitionLoader />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background selection:bg-primary-blue/10 selection:text-primary-blue">
      {/* Page Route Transition Overlay */}
      <PageTransitionLoader />

      {mode === "kiosk" ? (
        /* Kiosk / Desktop Mode (Landscape Orientation & Large Screens) */
        <div className="flex h-screen w-screen overflow-hidden">
          <KioskSidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Status Header */}
            <header className="h-16 border-b border-border bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <KioskLogo size="sm" />
                  <span className="font-black text-sm text-slate-900 tracking-tight">
                    KIOSK
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2.5 py-0.5 rounded-md border border-slate-200 uppercase tracking-wider">
                    Interactive Terminal
                  </span>
                </div>
                <span className="h-4 w-px bg-border hidden sm:block" />
                <span className="text-[11px] bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full hidden sm:flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AUTHENTICATED
                </span>
              </div>

              {/* Center & Right Status Elements */}
              <div className="flex items-center gap-3.5 text-xs">
                {/* Viewport switch toggle */}
                <button
                  onClick={() => setMode("mobile")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all text-[11px] font-bold cursor-pointer shadow-2xs"
                  title="Switch to Mobile Smartphone Mode"
                >
                  <Smartphone className="h-3.5 w-3.5 text-primary-blue" />
                  <span>Mobile View</span>
                </button>

                <span className="h-4 w-px bg-border" />

                <Link
                  href="/qr"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-primary-blue hover:bg-blue-100/70 transition-all font-bold text-[11px] cursor-pointer shadow-2xs"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Sync Mobile</span>
                </Link>

                <span className="h-4 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                    {userName.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-900 text-[12px] leading-tight">
                      {userName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono leading-none">
                      SB-849201
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Landscape Canvas */}
            <main className="flex-1 overflow-y-auto p-8 bg-transparent">
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                {children}
              </div>
            </main>

            {/* Modern Footer */}
            <footer className="h-11 border-t border-border/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 shrink-0 text-xs text-secondary-text font-medium">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>KIOSK Financial Intelligence & Literacy Platform</span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span>Touchscreen Terminal</span>
                <span className="text-muted-text">•</span>
                <span className="font-mono text-[10px] text-slate-500">v2.4 LTS</span>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        /* Mobile Mode (Portrait Phone Canvas with Realistic Device Frame on Desktop) */
        <div className="flex flex-col min-h-screen bg-slate-900/5 sm:bg-slate-100">
          {/* Top Preview Bar on wide screens */}
          <div className="hidden sm:flex h-10 bg-slate-900 text-white items-center justify-between px-6 text-xs font-semibold shrink-0 z-50">
            <div className="flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5 text-blue-400" />
              <span>Mobile Simulation Mode (Smartphone Portrait)</span>
            </div>
            <button
              onClick={() => setMode("kiosk")}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Back to Kiosk Desktop Mode</span>
            </button>
          </div>

          {/* Smartphone Frame Container */}
          <div className="flex-1 w-full max-w-md mx-auto bg-background min-h-screen sm:min-h-[calc(100vh-2.5rem)] sm:my-3 sm:rounded-3xl sm:border sm:border-slate-300 sm:shadow-2xl flex flex-col relative overflow-hidden">
            {/* Sticky Mobile Header */}
            <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-white/90 backdrop-blur-xl flex items-center justify-between px-5 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <KioskLogo size="sm" />
                <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-900 tracking-tight leading-tight">
                    KIOSK
                  </span>
                  <span className="text-[9.5px] text-emerald-600 font-bold flex items-center gap-1 leading-none mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Mobile Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode("kiosk")}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Switch to Kiosk Desktop mode"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <div className="text-[11px] text-slate-800 font-bold bg-slate-100/80 border border-slate-200/60 rounded-xl px-3 py-1.5 font-mono">
                  {userName.split(" ")[0]}
                </div>
              </div>
            </header>

            {/* Mobile Content Canvas */}
            <main
              className={`flex-1 bg-transparent ${
                pathname === "/ai"
                  ? "p-3 pb-20 overflow-hidden flex flex-col"
                  : "pb-24 p-4 overflow-y-auto"
              }`}
            >
              <div
                className={`w-full ${
                  pathname === "/ai"
                    ? "flex-1 flex flex-col min-h-0 h-full"
                    : "space-y-4"
                }`}
              >
                {children}
              </div>
            </main>

            {/* Bottom Fixed Navigation Bar */}
            <MobileBottomNav />
          </div>
        </div>
      )}
    </div>
  );
}
