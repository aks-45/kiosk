"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Info, ShieldCheck } from "lucide-react";

export default function FraudPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState<{
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    confidence: number;
    warningSigns: string[];
    explanation: string;
    recommendation: string;
  } | null>(null);

  const handleExample = (exampleText: string) => {
    setText(exampleText);
    setResults(null);
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const json = await res.json();
      if (json.success) {
        setResults({
          riskLevel: json.riskLevel,
          confidence: json.confidence,
          warningSigns: json.warningSigns || [],
          explanation: json.explanation,
          recommendation: json.recommendation,
        });
      } else {
        throw new Error(json.error || "Message scan failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact safety audit server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskStyles = (level: "LOW" | "MEDIUM" | "HIGH") => {
    if (level === "HIGH") {
      return {
        card: "border-red/30 bg-red/5",
        text: "text-red",
        badge: "bg-red/10 border-red/20 text-red",
        icon: AlertCircle,
      };
    }
    if (level === "MEDIUM") {
      return {
        card: "border-amber/30 bg-amber/5",
        text: "text-amber-600",
        badge: "bg-amber-50 border-amber-200 text-amber-600",
        icon: AlertTriangle,
      };
    }
    return {
      card: "border-green/30 bg-green/5",
      text: "text-green",
      badge: "bg-green/10 border-green/20 text-green",
      icon: ShieldCheck,
    };
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-secondary-text" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-main-text">
            Fraud & Safety Scanner
          </h1>
          <p className="text-xs text-secondary-text font-medium">
            Scan suspicious bank alerts or reward messages for warnings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Input Form Column (Span 3) */}
        <div className="space-y-5 md:col-span-3">
          <form
            onSubmit={handleCheck}
            className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Paste message alert or link
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 p-4 kiosk-input font-medium text-xs leading-relaxed"
                placeholder="Example: Your bank account will be blocked today. Click this link immediately to complete KYC."
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red/5 border border-red/15 text-red text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || text.trim() === ""}
              className="w-full h-12 bg-primary-blue text-white font-extrabold rounded-xl hover:bg-primary-blue/95 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? "SCANNING CONTENT..." : "CHECK NOW"}
            </button>
          </form>

          {/* Quick-test templates */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Quick Test Examples
            </span>
            <div className="grid gap-2">
              <button
                onClick={() =>
                  handleExample(
                    "Dear customer, your bank account will be suspended today. Update your KYC immediately to keep using online services by clicking this secure link: http://smartbank-login-secure.com"
                  )
                }
                className="w-full text-left p-3 bg-white hover:bg-slate-100/50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer truncate"
              >
                🚨 Scam Alert: Urgent KYC Account Block
              </button>
              <button
                onClick={() =>
                  handleExample(
                    "Congratulations! You won a ₹50,000 lottery cash reward from Smart Bank! To claim this gift card, share your 4-digit PIN code with our supervisor."
                  )
                }
                className="w-full text-left p-3 bg-white hover:bg-slate-100/50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer truncate"
              >
                🎁 Scam Alert: Lottery Gift Card demands PIN
              </button>
              <button
                onClick={() =>
                  handleExample(
                    "Your monthly salary credit of ₹30,000 has been processed successfully. Check your ledger statements under the Account Overview section."
                  )
                }
                className="w-full text-left p-3 bg-white hover:bg-slate-100/50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer truncate"
              >
                ✅ Safe Alert: Ledger Salary Credit Notice
              </button>
            </div>
          </div>
        </div>

        {/* Scan Outputs Column (Span 2) */}
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="bg-white border border-border p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-secondary-text">Safety Audit Running...</p>
            </div>
          ) : results ? (
            /* Results Panel */
            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in flex flex-col justify-between">
              {/* Header Badge */}
              <div
                className={`p-6 border-b flex flex-col items-center text-center space-y-2 border-border ${
                  getRiskStyles(results.riskLevel).card
                }`}
              >
                <div className="p-2 bg-white rounded-full shadow-sm">
                  {React.createElement(getRiskStyles(results.riskLevel).icon, {
                    className: `h-8 w-8 ${getRiskStyles(results.riskLevel).text}`,
                  })}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    Calculated Risk
                  </span>
                  <h2
                    className={`text-xl font-black mt-0.5 ${
                      getRiskStyles(results.riskLevel).text
                    }`}
                  >
                    {results.riskLevel} RISK
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Confidence: {Math.round(results.confidence * 100)}%
                </span>
              </div>

              {/* Signs & Warnings body */}
              <div className="p-6 space-y-4">
                {results.warningSigns.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Detected Warning Signs
                    </span>
                    <ul className="space-y-1">
                      {results.warningSigns.map((sign, index) => (
                        <li
                          key={index}
                          className="text-[11px] font-bold text-red bg-red/5 border border-red/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        >
                          <span className="inline-block w-1.5 h-1.5 bg-red rounded-full" />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Security Analysis
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {results.explanation}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Action Recommendation
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-bold">
                    {results.recommendation}
                  </p>
                </div>
              </div>

              {/* disclaimer footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
                Scan warning: Heuristic AI assessments are for digital safety learning and are not 100% accurate. Keep banking credentials private.
              </div>
            </div>
          ) : (
            /* Idle Instruction Block */
            <div className="bg-white border border-border p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center py-16 h-full">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-main-text text-sm">Awaiting message input</h3>
              <p className="text-xs text-secondary-text mt-2 max-w-xs mx-auto leading-relaxed">
                Enter an SMS or click one of the quick test templates to inspect it for scam warning signs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
