"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, CheckCircle, RefreshCw, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QRPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("INITIALIZING"); // INITIALIZING, READY, CONNECTED, ERROR
  const [qrUrl, setQrUrl] = useState("");

  // Create session on mount
  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("/api/kiosk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", kioskId: "SBK001" }),
        });
        const json = await res.json();
        
        if (json.success) {
          setSessionId(json.sessionId);
          setStatus("READY");

          const host = window.location.origin;
          const mobileAccessUrl = `${host}/mobile?sessionId=${json.sessionId}`;
          
          const encodedUrl = encodeURIComponent(mobileAccessUrl);
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}&margin=10`);
        } else {
          setStatus("ERROR");
        }
      } catch (e) {
        console.error("Failed to generate kiosk session:", e);
        setStatus("ERROR");
      }
    }

    createSession();
  }, []);

  // Poll database for pairing state
  useEffect(() => {
    if (status !== "READY" || !sessionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/kiosk?action=poll&sessionId=${sessionId}`);
        const json = await res.json();
        
        if (json.success && json.status === "CONNECTED") {
          setStatus("CONNECTED");
          clearInterval(pollInterval);
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (e) {
        console.error("Error polling pairing session:", e);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [status, sessionId, router]);

  const handleReset = async () => {
    if (sessionId) {
      await fetch("/api/kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", sessionId }),
      });
    }
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-border/90 p-8 sm:p-10 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        {/* Subtle accent header line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        <Link
          href="/dashboard"
          className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {status === "INITIALIZING" ? (
          <div className="py-12 space-y-4">
            <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-secondary-text">Creating secure pairing link...</p>
          </div>
        ) : status === "CONNECTED" ? (
          /* Paired checkmark state */
          <div className="py-10 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Device Connected</h2>
            <p className="text-xs text-secondary-text max-w-xs mx-auto leading-relaxed font-medium">
              Your personal phone is synchronized. Smart Bank will open in Portrait Mode on your device.
            </p>
          </div>
        ) : status === "ERROR" ? (
          /* Error state */
          <div className="py-10 space-y-4">
            <h2 className="text-lg font-extrabold text-rose-600">Pairing Failed</h2>
            <p className="text-xs text-secondary-text">
              Could not establish connection to the sync database.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              Retry Session
            </button>
          </div>
        ) : (
          /* QR Display State */
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Sync with Mobile</h2>
              <p className="text-xs text-secondary-text font-medium">
                Scan the QR code to load Smart Bank on your personal smartphone
              </p>
            </div>

            {/* QR Render wrapper */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl inline-block mx-auto shadow-2xs">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Session Access QR Code"
                  className="w-[190px] h-[190px] rounded-xl"
                />
              ) : (
                <div className="w-[190px] h-[190px] flex items-center justify-center text-xs text-slate-400 font-medium">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10.5px] bg-slate-100 text-slate-800 font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block border border-slate-200">
                Session: {sessionId}
              </span>
              <p className="text-[10.5px] text-muted-text leading-relaxed font-medium max-w-xs mx-auto">
                Scanning connects your phone in portrait mode, sharing the simulated ledger with zero credential leakage.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-primary-blue animate-spin" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Awaiting scanner pairing...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
