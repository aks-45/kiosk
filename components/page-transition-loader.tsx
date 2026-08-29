"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setIsLoading(true);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none">
      <div className="flex flex-col items-center space-y-4 p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800 shadow-2xl shadow-slate-950/20 max-w-xs text-center transform animate-slide-up">
        {/* Glowing circular loader with KIOSK Logo in the center */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Rotating Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-blue border-r-indigo-500 animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-slate-200/40 dark:border-slate-700/40" />

          {/* Glowing Backlight */}
          <div className="absolute w-12 h-12 bg-primary-blue/25 rounded-full blur-md animate-pulse" />

          {/* Logo Center */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md bg-slate-900 flex items-center justify-center border border-blue-400/30">
            <Image
              src="/kiosk-logo.png"
              alt="KIOSK Loading Logo"
              width={48}
              height={48}
              className="object-cover w-full h-full transform scale-110"
              priority
            />
          </div>
        </div>

        {/* Text & Module Indicator */}
        <div className="space-y-1">
          <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight uppercase">
            KIOSK Terminal
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-ping" />
            <span>Loading Module...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
