"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, RotateCcw, Sparkles, Bot, X, CheckCircle2, Loader2, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useDeviceMode } from "@/lib/device-mode-context";
import { CleanAIResponse } from "@/components/clean-ai-response";

function computeHealthScore(income: number, expenses: number, savings: number, investments: number) {
  const surplus = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  let score = 50;
  if (surplus > 0) {
    const surplusRatio = surplus / income;
    score += Math.min(25, Math.round(surplusRatio * 50));
  } else {
    score -= 20;
  }

  if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate > 0) score += 5;

  if (expenseRatio > 80) score -= 15;
  else if (expenseRatio <= 50) score += 10;

  if (investments > 0) score += 10;

  const finalScore = Math.max(10, Math.min(99, score));
  return {
    score: finalScore,
    surplus,
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    expenseRatio: parseFloat(expenseRatio.toFixed(1)),
  };
}

export default function FinancialHealthPage() {
  const { mode } = useDeviceMode();
  
  const [income, setIncome] = useState<number | string>(30000);
  const [expenses, setExpenses] = useState<number | string>(20000);
  const [savings, setSavings] = useState<number | string>(5000);
  const [investments, setInvestments] = useState<number | string>(2000);

  const [isAuditing, setIsAuditing] = useState(false);
  const [showCompleteNotification, setShowCompleteNotification] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [showExplainModal, setShowExplainModal] = useState(false);

  const [results, setResults] = useState<{
    score: number;
    surplus: number;
    savingsRate: number;
    expenseRatio: number;
    aiInsight: string;
  }>({
    score: 78,
    surplus: 10000,
    savingsRate: 16.7,
    expenseRatio: 66.7,
    aiInsight: "Your estimated monthly surplus is approximately ₹10,000 with a 16.7% savings rate. Living expenses are well-balanced against your income.",
  });

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedIncome = typeof income === "number" ? income : parseFloat(income) || 0;
    const parsedExpenses = typeof expenses === "number" ? expenses : parseFloat(expenses) || 0;
    const parsedSavings = typeof savings === "number" ? savings : parseFloat(savings) || 0;
    const parsedInvestments = typeof investments === "number" ? investments : parseFloat(investments) || 0;

    if (parsedIncome <= 0) return;

    setIsAuditing(true);
    setShowCompleteNotification(false);

    setTimeout(() => {
      const instantMetrics = computeHealthScore(parsedIncome, parsedExpenses, parsedSavings, parsedInvestments);
      
      let fastInsight = `Your estimated monthly surplus is ₹${instantMetrics.surplus.toLocaleString("en-IN")} with an approximate savings rate of ${instantMetrics.savingsRate}%. `;
      if (instantMetrics.score >= 70) {
        fastInsight += "Your financial health is strong with healthy cash cushions.";
      } else if (instantMetrics.score >= 50) {
        fastInsight += "Your budget is moderately balanced. Consider building a 3-month emergency fund.";
      } else {
        fastInsight += "Your expense ratio is high relative to income. Try optimizing discretionary spending.";
      }

      setResults({
        ...instantMetrics,
        aiInsight: fastInsight,
      });

      setIsAuditing(false);
      setShowCompleteNotification(true);

      setAiLoading(true);
      fetch("/api/financial-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: parsedIncome,
          expenses: parsedExpenses,
          savings: parsedSavings,
          investments: parsedInvestments,
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
        .catch((err) => console.error("Background AI fetch:", err))
        .finally(() => setAiLoading(false));
    }, 900);
  };

  const handleExplainResult = async () => {
    if (!results) return;
    setExplainLoading(true);
    setShowExplainModal(true);
    setExplanationText("");

    const parsedIncome = typeof income === "number" ? income : parseFloat(income) || 0;
    const parsedExpenses = typeof expenses === "number" ? expenses : parseFloat(expenses) || 0;
    const parsedSavings = typeof savings === "number" ? savings : parseFloat(savings) || 0;
    const parsedInvestments = typeof investments === "number" ? investments : parseFloat(investments) || 0;

    const contextStr = `Financial Health Score: ${results.score}/100\n- Income: ₹${parsedIncome}\n- Expenses: ₹${parsedExpenses}\n- Savings: ₹${parsedSavings}\n- Investments: ₹${parsedInvestments}\n- Surplus: ₹${results.surplus}\n- Savings Rate: ${results.savingsRate}%\n- Expense Ratio: ${results.expenseRatio}%`;

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
        throw new Error(json.error || "Could not generate AI explanation.");
      }
    } catch (err: any) {
      console.error(err);
      setExplanationText("Your score evaluates your estimated monthly surplus and savings cushion relative to your fixed monthly income.");
    } finally {
      setExplainLoading(false);
    }
  };

  const handleReset = () => {
    setIncome(30000);
    setExpenses(20000);
    setSavings(5000);
    setInvestments(2000);
    setShowCompleteNotification(false);
    setResults({
      score: 78,
      surplus: 10000,
      savingsRate: 16.7,
      expenseRatio: 66.7,
      aiInsight: "Based on your estimated numbers, your approximate monthly surplus is ₹10,000 and your savings rate is around 16.7%. Your living expenses appear well-balanced against your income.",
    });
  };

  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: "EXCELLENT", color: "text-emerald-700 border-emerald-200 bg-emerald-50" };
    if (score >= 60) return { label: "GOOD", color: "text-blue-700 border-blue-200 bg-blue-50" };
    if (score >= 40) return { label: "AVERAGE", color: "text-amber-700 border-amber-200 bg-amber-50" };
    return { label: "CRITICAL", color: "text-rose-700 border-rose-200 bg-rose-50" };
  };

  const numIncome = typeof income === "number" ? income : (parseFloat(String(income)) || 0);
  const numExpenses = typeof expenses === "number" ? expenses : (parseFloat(String(expenses)) || 0);
  const numSavings = typeof savings === "number" ? savings : (parseFloat(String(savings)) || 0);
  const numInvestments = typeof investments === "number" ? investments : (parseFloat(String(investments)) || 0);

  const chartData = [
    { name: "Income", Amount: numIncome, color: "#1D4ED8" },
    { name: "Expenses", Amount: numExpenses, color: "#E11D48" },
    { name: "Savings", Amount: numSavings, color: "#059669" },
    { name: "Investments", Amount: numInvestments, color: "#7C3AED" },
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-8 relative">
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
              Financial Health Audit
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              Diagnostic Module
            </span>
          </div>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            Audit surplus margins, emergency reserves, expense ratios & AI health score.
          </p>
        </div>
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
                Financial Audit Completed!
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Health Score: <strong>{results.score}/100</strong> • Monthly Surplus: <strong>₹{results.surplus.toLocaleString("en-IN")}</strong>
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

      {/* Audit Layout Splits */}
      <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-5" : "grid-cols-1"}`}>
        {/* Form Inputs (Span 2) */}
        <form
          onSubmit={handleAudit}
          className={`bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between ${
            mode === "kiosk" ? "col-span-2" : "col-span-1"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Financial Parameters
              </h3>
              <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full font-bold">
                Estimates Allowed
              </span>
            </div>

            {/* Fixed Income Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Monthly Income</span>
                <span className="text-[10px] text-muted-text font-medium lowercase">
                  (fixed salary / earnings)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIncome(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50"
                  placeholder="30000"
                  required
                />
              </div>
            </div>

            {/* Approx Expenses */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Monthly Expenses</span>
                <span className="text-[10px] text-primary-blue font-medium lowercase">
                  (living costs & bills)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExpenses(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50"
                  placeholder="20000"
                  required
                />
              </div>
            </div>

            {/* Approx Savings */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Monthly Savings Buffer</span>
                <span className="text-[10px] text-emerald-600 font-medium lowercase">
                  (cash reserve)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={savings}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSavings(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50"
                  placeholder="5000"
                  required
                />
              </div>
            </div>

            {/* Approx Investments */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Monthly Investments</span>
                <span className="text-[10px] text-purple-600 font-medium lowercase">
                  (SIP / stocks / RD)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInvestments(val === "" ? "" : Number(val));
                  }}
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50"
                  placeholder="2000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isAuditing}
              className="flex-1 h-11 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isAuditing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auditing Ledger...</span>
                </div>
              ) : (
                <span>RUN HEALTH AUDIT</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer"
              title="Reset values"
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
                Auditor Scorecard
              </h3>
              {results && (
                <button
                  onClick={handleExplainResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 text-primary-blue border border-blue-200/60 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Explain (AI)</span>
                </button>
              )}
            </div>

            <div className={`grid gap-6 items-center ${mode === "kiosk" ? "sm:grid-cols-3" : "grid-cols-1"}`}>
              {/* Radial Score Circle */}
              <div className="flex flex-col items-center text-center space-y-1">
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
                      stroke="#1D4ED8"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * results.score) / 100}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {results.score}
                    </span>
                    <span className="text-[9px] text-muted-text font-bold uppercase">
                      / 100
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold border px-3 py-0.5 rounded-full mt-2 block uppercase tracking-wider ${
                    getScoreRating(results.score).color
                  }`}
                >
                  {getScoreRating(results.score).label}
                </span>
              </div>

              {/* Ratios Columns */}
              <div className={`space-y-4 ${mode === "kiosk" ? "sm:col-span-2" : "col-span-1"}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block">
                      Estimated Surplus
                    </span>
                    <p
                      className={`font-black text-sm mt-0.5 font-mono ${
                        results.surplus >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {results.surplus >= 0 ? "+" : ""}₹
                      {results.surplus.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block">
                      Savings Ratio
                    </span>
                    <p className="font-black text-sm text-slate-900 mt-0.5 font-mono">
                      {results.savingsRate}%
                    </p>
                  </div>
                </div>

                <div className="h-28 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
                    >
                      <XAxis dataKey="name" fontSize={9} tickLine={false} />
                      <YAxis fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#0F172A",
                          color: "#F8FAFC",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      />
                      <Bar dataKey="Amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/30 border border-blue-200/60 p-5 rounded-2xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-blue animate-pulse-slow" />
                  <span className="text-xs font-black text-primary-blue uppercase tracking-wider">
                    AI Financial Health Diagnosis
                  </span>
                </div>
                {aiLoading && (
                  <span className="text-[10px] text-primary-blue font-bold animate-pulse">
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
              <div className="p-2.5 bg-blue-50 text-primary-blue rounded-xl border border-blue-100">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  AI Diagnostic Breakdown
                </h3>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                  Smart Bank Financial Intelligence Engine
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl min-h-[100px] flex items-center justify-center">
              {explainLoading ? (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Generating plain-language explanation...</p>
                </div>
              ) : (
                <CleanAIResponse text={explanationText} className="w-full" />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-muted-text font-medium">
                Diagnostic summary for financial planning awareness.
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
