"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Landmark, Smartphone } from "lucide-react";
import { useDeviceMode } from "@/lib/device-mode-context";

function MobileAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { setMode } = useDeviceMode();

  const [status, setStatus] = useState("CONNECTING"); // CONNECTING, SUCCESS, ERROR
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Explicitly override to Mobile Layout for scanned devices
    setMode("mobile");

    async function connectSession() {
      if (!sessionId) {
        setStatus("ERROR");
        setErrorMsg("Missing Session ID in QR Code scan. Please scan the kiosk QR again.");
        return;
      }

      try {
        // Post connection flag to backend
        const res = await fetch("/api/kiosk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "connect", sessionId }),
        });
        const json = await res.json();

        if (json.success) {
          // Pre-authenticate the mobile client
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId: "SBK001", pin: "1234" }),
          });
          const loginJson = await loginRes.json();

          if (loginJson.success) {
            setStatus("SUCCESS");
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.replace("/dashboard");
            }, 1200);
          } else {
            throw new Error("Failed to authenticate session profile.");
          }
        } else {
          throw new Error("Active session expired or invalid.");
        }
      } catch (err: any) {
        console.error(err);
        setStatus("ERROR");
        setErrorMsg(err.message || "Failed to pair with physical kiosk terminal.");
      }
    }

    connectSession();
  }, [sessionId, router, setMode]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 min-h-screen">
      <div className="max-w-md w-full bg-white rounded-3xl border border-border p-8 shadow-xl">
        <div className="w-16 h-16 bg-light-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <Smartphone className="h-8 w-8 text-primary-blue" />
        </div>

        {status === "CONNECTING" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-main-text">Connecting to Kiosk...</h2>
            <div className="w-8 h-8 border-4 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
            <p className="text-xs text-secondary-text font-semibold">
              Establishing synchronized terminal session: {sessionId}
            </p>
          </div>
        ) : status === "SUCCESS" ? (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-green/10 border border-green/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-green" />
            </div>
            <h2 className="text-xl font-black text-main-text">Kiosk Synced Successfully</h2>
            <p className="text-xs text-secondary-text font-semibold">
              Opening your financial intelligence dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-red/10 border border-red/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-red" />
            </div>
            <h2 className="text-xl font-black text-red">Connection Error</h2>
            <p className="text-xs text-slate-600 font-semibold">{errorMsg}</p>
            <button
              onClick={() => router.replace("/")}
              className="mt-4 bg-primary-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Start New Session
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <Landmark className="h-4.5 w-4.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Smart Bank Portal
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MobileAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 min-h-screen text-center">
          <div className="w-8 h-8 border-4 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
          <p className="text-xs text-secondary-text mt-2 font-bold">Initializing portal loader...</p>
        </div>
      }
    >
      <MobileAccessContent />
    </Suspense>
  );
}
