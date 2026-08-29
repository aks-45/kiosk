"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Sparkles,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Services", href: "/dashboard#services", icon: LayoutGrid },
  { label: "AI Chat", href: "/ai", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/80 bg-white/90 backdrop-blur-xl flex items-center justify-around px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href.split("#")[0] === pathname;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
              isActive ? "text-primary-blue" : "text-secondary-text"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-blue/10 text-primary-blue scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                isActive ? "font-extrabold text-primary-blue" : "font-semibold text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
