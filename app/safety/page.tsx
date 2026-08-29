"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Lock, Smartphone, Globe, HelpCircle, Check, X, ShieldAlert, Sparkles, Send } from "lucide-react";
import { CleanAIResponse } from "@/components/clean-ai-response";
import { useDeviceMode } from "@/lib/device-mode-context";

interface FraudResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  warningSigns: string[];
  explanation: string;
  recommendation: string;
}

const SAFETY_TIPS = [
  {
    id: 1,
    title: "Never Share OTP or PIN",
    category: "Authentication",
    icon: Lock,
    description: "Bank officials or customer support will NEVER ask for your One-Time Password (OTP), UPI PIN, or ATM PIN. Sharing these gives attackers direct access to your funds.",
  },
  {
    id: 2,
    title: "Beware of Urgent KYC Alerts",
    category: "Phishing",
    icon: AlertCircle,
    description: "Scammers send SMS messages stating your account or SIM card will be blocked immediately unless you click a link. Official banks never block accounts via third-party SMS links.",
  },
  {
    id: 3,
    title: "Verify UPI Payment Requests",
    category: "UPI Safety",
    icon: Smartphone,
    description: "Entering your UPI PIN is only required to SEND money, never to receive money. If a buyer asks you to enter your PIN to claim payment, it is a scam.",
  },
  {
    id: 4,
    title: "Check Website URLs & HTTPS",
    category: "Web Security",
    icon: Globe,
    description: "Always look for https:// and the correct bank domain name before entering passwords. Fake phishing websites often use slight misspellings (e.g. sbi-support-portal.top).",
  },
];

const SCAM_QUIZ = [
  {
    id: 1,
    message: "URGENT: Your SBI account has been suspended due to incomplete PAN update. Click http://bit.ly/sbi-pan-kyc to reactivate within 24 hours.",
    isScam: true,
    explanation: "This is a classic phishing SMS. It uses urgency ('suspended within 24h') and an unverified shortened link (bit.ly) to steal credentials.",
  },
  {
    id: 2,
    message: "Dear Customer, ₹5,000 has been debited from your A/C ending in 4102 on 28-Aug. Available Bal: ₹28,450. Call 1800-1234 if not you.",
    isScam: false,
    explanation: "This is a standard transactional SMS alert. It provides masked account info and a verified toll-free customer support helpline.",
  },
  {
    id: 3,
    message: "Congratulations! You have won ₹25,000 cashback in the Smart Bank Lucky Draw. Enter your UPI PIN on this link to accept the reward.",
    isScam: true,
    explanation: "Scam! You never need to enter a UPI PIN to receive money or cashbacks. Entering your PIN transfers money out of your account.",
  },
];

function SafetyContent() {
  const { mode } = useDeviceMode();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "CHECKER" | "TIPS" | "QUIZ") || "CHECKER";

  const [activeTab, setActiveTab] = useState<"CHECKER" | "TIPS" | "QUIZ">(initialTab);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FraudResult | null>(null);
  const [error, setError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, "SUSPICIOUS" | "SAFE">>({});

  const handleCheckMessage = async (e: React.FormEvent) => {
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
        throw new Error(json.error || "Scan failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact safety scanner.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (quizId: number, answer: "SUSPICIOUS" | "SAFE") => {
    setQuizAnswers((prev) => ({ ...prev, [quizId]: answer }));
  };

  const getRiskStyles = (level: "LOW" | "MEDIUM" | "HIGH") => {
    if (level === "HIGH") {
      return {
        card: "border-rose-200 bg-rose-50/60",
        text: "text-rose-700",
        badge: "bg-rose-100/80 border-rose-200 text-rose-700",
        icon: AlertCircle,
      };
    }
    if (level === "MEDIUM") {
      return {
        card: "border-amber-200 bg-amber-50/60",
        text: "text-amber-700",
        badge: "bg-amber-100/80 border-amber-200 text-amber-700",
        icon: AlertTriangle,
      };
    }
    return {
      card: "border-emerald-200 bg-emerald-50/60",
      text: "text-emerald-700",
      badge: "bg-emerald-100/80 border-emerald-200 text-emerald-700",
      icon: CheckCircle2,
    };
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2.5 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Digital Safety & Scam Shield
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
              Threat Intelligence
            </span>
          </div>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            Identify phishing scams, analyze suspicious SMS messages, and practice fraud detection.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border/80 gap-2 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("CHECKER")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "CHECKER"
              ? "bg-white border border-border/90 border-b-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <span>Scam Message Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab("TIPS")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "TIPS"
              ? "bg-white border border-border/90 border-b-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Lock className="h-4 w-4 text-blue-600" />
          <span>Security Guidelines</span>
        </button>
        <button
          onClick={() => setActiveTab("QUIZ")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "QUIZ"
              ? "bg-white border border-border/90 border-b-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="h-4 w-4 text-purple-600" />
          <span>Interactive Quiz</span>
        </button>
      </div>

      {/* TAB A: MESSAGE CHECKER */}
      {activeTab === "CHECKER" && (
        <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-5" : "grid-cols-1"}`}>
          <div className={`space-y-4 ${mode === "kiosk" ? "col-span-3" : "col-span-1"}`}>
            <form
              onSubmit={handleCheckMessage}
              className="bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Suspicious SMS, Email or Link
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-32 p-4 kiosk-input font-medium text-xs leading-relaxed bg-slate-50/50"
                  placeholder="Example: Your bank account will be blocked today. Click this link immediately to complete KYC..."
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || text.trim() === ""}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing message patterns...</span>
                  </div>
                ) : (
                  <span>RUN SECURITY SCAN</span>
                )}
              </button>
            </form>

            <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold text-muted-text uppercase tracking-wider block">
                Quick Test Samples
              </span>
              <button
                onClick={() => {
                  setText("Your bank account will be blocked today. Click http://bank-kyc-update.com immediately to complete KYC.");
                  setResults(null);
                }}
                className="w-full text-left p-3 bg-white hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 transition-all cursor-pointer truncate shadow-2xs"
              >
                🚨 &ldquo;Your bank account will be blocked today. Click http://bank-kyc-update.com...&rdquo;
              </button>
            </div>
          </div>

          <div className={`${mode === "kiosk" ? "col-span-2" : "col-span-1"}`}>
            {isLoading ? (
              <div className="bg-white border border-border/90 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-secondary-text">Scanning message for phishing signatures...</p>
              </div>
            ) : results ? (
              <div className="bg-white border border-border/90 rounded-2xl shadow-xs overflow-hidden animate-fade-in space-y-0">
                <div
                  className={`p-5 border-b flex flex-col items-center text-center space-y-2 border-border ${
                    getRiskStyles(results.riskLevel).card
                  }`}
                >
                  <div className="p-2.5 bg-white rounded-2xl shadow-2xs">
                    {React.createElement(getRiskStyles(results.riskLevel).icon, {
                      className: `h-7 w-7 ${getRiskStyles(results.riskLevel).text}`,
                    })}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">
                      Calculated Risk Assessment
                    </span>
                    <h2
                      className={`text-xl font-black mt-0.5 ${
                        getRiskStyles(results.riskLevel).text
                      }`}
                    >
                      {results.riskLevel} RISK DETECTED
                    </h2>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {results.warningSigns.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-muted-text font-extrabold uppercase tracking-wider block">
                        Warning Indicators
                      </span>
                      <ul className="space-y-1">
                        {results.warningSigns.map((sign, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] font-bold text-rose-700 bg-rose-50/80 border border-rose-200/60 px-2.5 py-1 rounded-lg flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-text font-extrabold uppercase tracking-wider block">
                      Threat Analysis
                    </span>
                    <CleanAIResponse text={results.explanation} />
                  </div>

                  <div className="space-y-1 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-muted-text font-extrabold uppercase tracking-wider block">
                      Recommended Action
                    </span>
                    <p className="text-xs text-slate-900 font-bold leading-relaxed">
                      {results.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/80 border border-slate-200/80 border-dashed p-8 rounded-2xl text-center space-y-2 h-full flex flex-col items-center justify-center min-h-[180px]">
                <ShieldCheck className="h-9 w-9 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  AI Scam Analyzer Ready
                </h4>
                <p className="text-[11px] text-muted-text leading-relaxed font-medium">
                  Paste any SMS, link or message on the left to evaluate threat signatures.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: SAFETY RULES */}
      {activeTab === "TIPS" && (
        <div className={`grid gap-4 ${mode === "kiosk" ? "grid-cols-2" : "grid-cols-1"}`}>
          {SAFETY_TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.id}
                className="bg-white border border-border/90 p-6 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-primary-blue rounded-xl border border-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-primary-blue tracking-wider">
                      {tip.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {tip.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-secondary-text leading-relaxed font-medium">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB C: SCAM QUIZ */}
      {activeTab === "QUIZ" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Interactive Scam Detection Quiz
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Practice identifying real-world phishing and banking fraud alerts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
              {Object.keys(quizAnswers).length} / {SCAM_QUIZ.length} Answered
            </span>
          </div>

          <div className="grid gap-4">
            {SCAM_QUIZ.map((q) => {
              const selectedAnswer = quizAnswers[q.id];
              const isCorrect =
                selectedAnswer !== undefined &&
                ((selectedAnswer === "SUSPICIOUS" && q.isScam) ||
                  (selectedAnswer === "SAFE" && !q.isScam));

              return (
                <div
                  key={q.id}
                  className="bg-white border border-border/90 p-6 rounded-2xl shadow-xs space-y-4"
                >
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-800 leading-relaxed">
                    &ldquo;{q.message}&rdquo;
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuizAnswer(q.id, "SUSPICIOUS")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedAnswer === "SUSPICIOUS"
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      🚨 Flag as Suspicious / Scam
                    </button>
                    <button
                      onClick={() => handleQuizAnswer(q.id, "SAFE")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedAnswer === "SAFE"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      ✅ Looks Safe & Authentic
                    </button>
                  </div>

                  {selectedAnswer && (
                    <div
                      className={`p-4 rounded-xl text-xs font-semibold space-y-1 animate-slide-up ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {isCorrect ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Correct Decision!</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-rose-600" />
                            <span>Incorrect — Be Careful!</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SafetyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh] text-center">
          <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
          <p className="text-xs text-secondary-text mt-2 font-bold">Loading Digital Safety Center...</p>
        </div>
      }
    >
      <SafetyContent />
    </Suspense>
  );
}
