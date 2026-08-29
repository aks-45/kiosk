import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DeviceModeProvider } from "@/lib/device-mode-context";
import { LayoutShell } from "@/components/layout-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KIOSK - AI-Assisted Financial Terminal",
  description: "Understand. Analyse. Decide. An educational self-service fintech kiosk terminal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-main-text font-sans selection:bg-primary-blue/10 selection:text-primary-blue">
        <DeviceModeProvider>
          <LayoutShell>{children}</LayoutShell>
        </DeviceModeProvider>
      </body>
    </html>
  );
}
