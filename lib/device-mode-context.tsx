"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type DeviceMode = "kiosk" | "mobile";

interface DeviceModeContextType {
  mode: DeviceMode;
  isManualOverride: boolean;
  setMode: (mode: DeviceMode) => void;
  resetToAutomatic: () => void;
}

const DeviceModeContext = createContext<DeviceModeContextType | undefined>(undefined);

export function DeviceModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DeviceMode>("kiosk");
  const [isManualOverride, setIsManualOverride] = useState(false);

  useEffect(() => {
    if (isManualOverride) return;

    const handleResize = () => {
      // Responsive layout detection:
      // 1. Desktops, Laptops & Wide screens (width >= 768px) -> Kiosk/Desktop layout
      // 2. Horizontally mounted phone/tablet (landscape and width >= 560px) -> Kiosk/Desktop layout
      // 3. Portrait smartphones (width < 768px and height > width) -> Mobile layout
      const isLandscape = window.innerWidth > window.innerHeight;
      const isDesktopWidth = window.innerWidth >= 768;
      const isLandscapeKiosk = isLandscape && window.innerWidth >= 560;

      if (isDesktopWidth || isLandscapeKiosk) {
        setModeState("kiosk");
      } else {
        setModeState("mobile");
      }
    };

    // Run on initial mount
    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [isManualOverride]);

  const setMode = (newMode: DeviceMode) => {
    setModeState(newMode);
    setIsManualOverride(true);
  };

  const resetToAutomatic = () => {
    setIsManualOverride(false);
    const isLandscape = window.innerWidth > window.innerHeight;
    const isDesktopWidth = window.innerWidth >= 768;
    const isLandscapeKiosk = isLandscape && window.innerWidth >= 560;
    setModeState(isDesktopWidth || isLandscapeKiosk ? "kiosk" : "mobile");
  };

  return (
    <DeviceModeContext.Provider
      value={{ mode, isManualOverride, setMode, resetToAutomatic }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
}

export function useDeviceMode() {
  const context = useContext(DeviceModeContext);
  if (!context) {
    throw new Error("useDeviceMode must be used within a DeviceModeProvider");
  }
  return context;
}
