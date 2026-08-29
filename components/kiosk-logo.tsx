"use client";

import React from "react";
import Image from "next/image";

interface KioskLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
}

export function KioskLogo({
  size = "md",
  className = "",
  showText = false,
  textClassName = "",
  subtitle = "Financial Intelligence",
}: KioskLogoProps) {
  const sizeMap = {
    sm: { px: 24, container: "w-6 h-6 rounded-md", text: "text-sm", sub: "text-[8.5px]" },
    md: { px: 36, container: "w-9 h-9 rounded-xl", text: "text-base", sub: "text-[9.5px]" },
    lg: { px: 48, container: "w-12 h-12 rounded-2xl", text: "text-xl", sub: "text-[10px]" },
    xl: { px: 72, container: "w-18 h-18 rounded-3xl", text: "text-3xl", sub: "text-xs" },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${current.container} relative overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-900 to-primary-blue flex items-center justify-center shrink-0 shadow-sm border border-blue-400/20`}
      >
        <Image
          src="/kiosk-logo.png"
          alt="KIOSK Logo"
          width={current.px}
          height={current.px}
          className="object-cover w-full h-full transform scale-110"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-black tracking-tight text-slate-900 leading-tight ${current.text} ${textClassName}`}
          >
            KIOSK
          </span>
          {subtitle && (
            <span
              className={`font-bold text-primary-blue uppercase tracking-widest leading-none mt-0.5 ${current.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
