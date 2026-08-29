"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, RotateCcw, Sparkles, Bot, X, Zap, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useDeviceMode } from "@/lib/device-mode-context";
import { CleanAIResponse } from "@/components/clean-ai-response";

export default function GoalsPage() {
  const { mode } = useDeviceMode();
  const [goalName, setGoalName] = useState("New Laptop");
  const [targetAmount, setTargetAmount] = useState<number | string>(50000);
  const [currentSavings, setCurrentSavings] = useState<number | string>(10000);
  const [months, setMonths] = useState<number | string>(10);

  const [isCalculating, setIsCalculating] = useState(false);
  const [showCompleteNotification, setShowCompleteNotification] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [showExplainModal, setShowExplainModal] = useState(false);

  const [results, setResults] = useState<{
    remainingAmount: number;
    requiredMonthlySaving: number;
    progressPercent: number;
    aiInsight: string;
  }>({
    remainingAmount: 40000,
    requiredMonthlySaving: 4000,
    progressPercent: 20,
    aiInsight: "To reach your ₹50,000 goal in 10 months, you need to save approximately ₹4,000 per month.",
  });

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsedTarget = typeof targetAmount === "number" ? targetAmount : parseFloat(targetAmount) || 0;
    const parsedCurrent = typeof currentSavings === "number" ? currentSavings : parseFloat(currentSavings) || 0;
    const parsedMonths = typeof months === "number" ? months : parseInt(months) || 1;

    if (parsedTarget <= 0 || parsedMonths <= 0) return;

    setIsCalculating(true);
    setShowCompleteNotification(false);

    setTimeout(() => {
      const remainingAmount = Math.max(0, parsedTarget - parsedCurrent);
      const requiredMonthlySaving = Math.round(remainingAmount / parsedMonths);
      const progressPercent = Math.min(100, Math.round((parsedCurrent / parsedTarget) * 100));

      let fastInsight = `To achieve "${goalName || "your savings goal"}" (₹${parsedTarget.toLocaleString("en-IN")}) in ${parsedMonths} months, you need to save ₹${requiredMonthlySaving.toLocaleString("en-IN")} per month. You are currently ${progressPercent}% of the way there.`;

      setResults({
        remainingAmount,
        requiredMonthlySaving,
        progressPercent,
        aiInsight: fastInsight,
      });

      setIsCalculating(false);
      setShowCompleteNotification(true);

      setAiLoading(true);
      fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalName: goalName.trim() || "Savings Goal",
          targetAmount: parsedTarget,
          currentSavings: parsedCurrent,
          months: parsedMonths,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.aiInsight) {
            setResults((prev) => ({
              ...prev,
              aiInsight: json.aiInsight,
            }));
          }
        })
        .catch((err) => console.error("Background goal AI fetch:", err))
        .finally(() => setAiLoading(false));
    }, 900);
  };

  const handleUseSampleGoal = () => {
    setGoalName("New Laptop");
    setTargetAmount(50000);
    setCurrentSavings(10000);
    setMonths(10);
    setShowCompleteNotification(false);
    setResults({
      remainingAmount: 40000,
      requiredMonthlySaving: 4000,
      progressPercent: 20,
      aiInsight: "To reach your ₹50,000 goal in 10 months, you need to save approximately ₹4,000 per month.",
    });
  };

  const handleReset = () => {
    setGoalName("");
    setTargetAmount("");
    setCurrentSavings("");
    setMonths("");
    setShowCompleteNotification(false);
    setResults({
      remainingAmount: 0,
      requiredMonthlySaving: 0,
      progressPercent: 0,
      aiInsight: "Enter your goal parameters and timeline to calculate your savings target.",
    });
  };

  const handleExplainResult = async () => {
    if (!results) return;
    setExplainLoading(true);
    setShowExplainModal(true);
    setExplanationText("");

    const parsedTarget = typeof targetAmount === "number" ? targetAmount : parseFloat(targetAmount) || 0;
    const parsedCurrent = typeof currentSavings === "number" ? currentSavings : parseFloat(currentSavings) || 0;
    const parsedMonths = typeof months === "number" ? months : parseInt(months) || 1;

    const contextStr = `Financial Goal: ${goalName}\n- Target: ₹${parsedTarget}\n- Current Savings: ₹${parsedCurrent}\n- Remaining: ₹${results.remainingAmount}\n- Timeline: ${parsedMonths} months\n- Monthly Required: ₹${results.requiredMonthlySaving}/month\n- Progress: ${results.progressPercent}%`;

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: contextStr }),
      });
      const json = await res.json();
      if (json.success && json.explanation) {
        setExplanationText(json.explanation);
      } else {
        throw new Error(json.error || "Failed to generate AI explanation.");
      }
    } catch (err: any) {
      console.error(err);
      setExplanationText("Your goal calculations determine the exact monthly contribution required based on your timeline and initial savings cushion.");
    } finally {
      setExplainLoading(false);
    }
  };

  const activeMonths = typeof months === "number" && months > 0 ? months : (parseInt(String(months)) || 1);
  const activeTarget = typeof targetAmount === "number" ? targetAmount : (parseFloat(String(targetAmount)) || 0);

  return (
    <div className="space-y-6 animate-slide-up pb-8 relative">
      {/* Title Header */}
      <div className="flex items-center justify-between">
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
                Financial Goals Planner
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Savings Engine
              </span>
            </div>
            <p className="text-xs text-secondary-text font-medium mt-0.5">
              Simulate savings horizons, required monthly contributions, and progress milestones.
            </p>
          </div>
        </div>

        <button
          onClick={handleUseSampleGoal}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <Zap className="h-3.5 w-3.5 text-emerald-600" />
          <span>Use Sample Goal</span>
        </button>
      </div>

      {/* Completion Notification Pop-up Banner */}
      {showCompleteNotification && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-slide-up border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-wide">
                Goal Strategy Calculated Successfully!
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Save <strong>₹{results.requiredMonthlySaving.toLocaleString("en-IN")}/month</strong> for {activeMonths} months to reach ₹{activeTarget.toLocaleString("en-IN")}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompleteNotification(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid splits */}
      <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-5" : "grid-cols-1"}`}>
        {/* Form Column (Span 2) */}
        <form
          onSubmit={handleCalculate}
          className={`bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between ${
            mode === "kiosk" ? "col-span-2" : "col-span-1"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Goal Parameters
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                Real-time Simulation
              </span>
            </div>

            {/* Goal Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Goal Description
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full h-11 px-4 kiosk-input font-bold text-sm bg-slate-50/50"
                placeholder="e.g. New Laptop, Emergency Fund"
                required
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetAmount(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50 font-mono"
                  placeholder="50000"
                  required
                />
              </div>
            </div>

            {/* Current Savings */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Saved Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentSavings(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50 font-mono"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Months */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Timeline (Months)
              </label>
              <input
                type="number"
                value={months}
                min={1}
                max={120}
                onChange={(e) => {
                  const val = e.target.value;
                  setMonths(val === "" ? "" : Number(val));
                }}
                className="w-full h-11 px-4 kiosk-input font-bold text-sm bg-slate-50/50 font-mono"
                placeholder="e.g. 12"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isCalculating}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Simulating Goal...</span>
                </div>
              ) : (
                <span>CALCULATE STRATEGY</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer"
              title="Reset fields"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Results Panel (Span 3) */}
        <div className={`space-y-6 flex flex-col justify-between ${mode === "kiosk" ? "col-span-3" : "col-span-1"}`}>
          <div className="bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Goal Strategy Summary
              </h3>
              {results && (
                <button
                  onClick={handleExplainResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 text-primary-blue border border-blue-200/60 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Explain Strategy (AI)</span>
                </button>
              )}
            </div>

            <div className={`grid gap-6 items-center ${mode === "kiosk" ? "sm:grid-cols-3" : "grid-cols-1"}`}>
              {/* Progress Circle & Months Badge */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      stroke="#F1F5F9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      stroke="#059669"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * results.progressPercent) / 100}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {results.progressPercent}%
                    </span>
                    <span className="text-[9px] text-muted-text font-bold uppercase">
                      Saved
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  <span>{activeMonths} MONTHS TIMELINE</span>
                </span>
              </div>

              {/* Outputs Columns */}
              <div className={`space-y-4 ${mode === "kiosk" ? "sm:col-span-2" : "col-span-1"}`}>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">
                    Required Monthly Saving
                  </span>
                  <h2 className="text-2xl font-black text-emerald-600 font-mono">
                    ₹{results.requiredMonthlySaving.toLocaleString("en-IN")}
                    <span className="text-xs text-slate-400 font-semibold font-sans"> / month</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-muted-text uppercase">
                      Target Goal
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                      ₹{activeTarget.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-muted-text uppercase">
                      Remaining Needed
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                      ₹{results.remainingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Goal Insight */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-200/70 p-5 rounded-2xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse-slow" />
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                    AI Goal Trajectory Analysis
                  </span>
                </div>
                {aiLoading && (
                  <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                    Refreshing...
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-800 leading-relaxed font-semibold">
                <CleanAIResponse text={results.aiInsight} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explain My Result Modal */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-border max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowExplainModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  AI Goal Strategy Breakdown
                </h3>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                  Smart Bank Financial Intelligence Engine
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl min-h-[100px] flex items-center justify-center">
              {explainLoading ? (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Generating goal strategy explanation...</p>
                </div>
              ) : (
                <CleanAIResponse text={explanationText} className="w-full" />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-muted-text font-medium">
                Educational planning simulation.
              </span>
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
