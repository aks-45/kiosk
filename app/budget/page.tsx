"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart, RotateCcw, Sparkles, Bot, X, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from "recharts";
import { useDeviceMode } from "@/lib/device-mode-context";
import { CleanAIResponse } from "@/components/clean-ai-response";

interface CategoryInput {
  name: string;
  amount: number | string;
  color: string;
}

const DEFAULT_CATEGORIES: CategoryInput[] = [
  { name: "Housing / Bills", amount: 8000, color: "#1D4ED8" },
  { name: "Food & Groceries", amount: 4000, color: "#059669" },
  { name: "Transport", amount: 2000, color: "#0284C7" },
  { name: "Education", amount: 3000, color: "#7C3AED" },
  { name: "Shopping", amount: 2000, color: "#D97706" },
  { name: "Entertainment", amount: 1000, color: "#DB2777" },
  { name: "Savings Buffer", amount: 6000, color: "#0D9488" },
  { name: "Emergency Fund", amount: 2000, color: "#4F46E5" },
  { name: "Other Expenses", amount: 0, color: "#94A3B8" },
];

export default function BudgetPage() {
  const { mode } = useDeviceMode();
  const [income, setIncome] = useState<number | string>(30000);
  const [categories, setCategories] = useState<CategoryInput[]>(DEFAULT_CATEGORIES);

  const [isCalculating, setIsCalculating] = useState(false);
  const [showCompleteNotification, setShowCompleteNotification] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [showExplainModal, setShowExplainModal] = useState(false);

  const [results, setResults] = useState<{
    totalPlanned: number;
    remaining: number;
    savingsAmount: number;
    savingsPercent: number;
    aiInsight: string;
  }>({
    totalPlanned: 28000,
    remaining: 2000,
    savingsAmount: 6000,
    savingsPercent: 20,
    aiInsight: "Your planned budget leaves ₹2,000 unallocated. You could keep this as a buffer or add it to your emergency savings.",
  });

  const handleCategoryChange = (index: number, rawVal: string) => {
    const updated = [...categories];
    updated[index].amount = rawVal === "" ? "" : Number(rawVal);
    setCategories(updated);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsedIncome = typeof income === "number" ? income : parseFloat(income) || 0;
    if (parsedIncome <= 0) return;

    const sanitizedCategories = categories.map((c) => ({
      name: c.name,
      amount: typeof c.amount === "number" ? c.amount : parseFloat(String(c.amount)) || 0,
    }));

    setIsCalculating(true);
    setShowCompleteNotification(false);

    setTimeout(() => {
      const totalPlanned = sanitizedCategories.reduce((sum, c) => sum + c.amount, 0);
      const remaining = parsedIncome - totalPlanned;

      const savingsCat = sanitizedCategories.find((c) =>
        c.name.toLowerCase().includes("saving") || c.name.toLowerCase().includes("emergency")
      );
      const savingsAmount = savingsCat ? savingsCat.amount : 0;
      const savingsPercent = Math.round((savingsAmount / parsedIncome) * 100);

      let fastInsight = `You have allocated ₹${totalPlanned.toLocaleString("en-IN")} out of ₹${parsedIncome.toLocaleString("en-IN")}. `;
      if (remaining > 0) {
        fastInsight += `You have an unallocated buffer of ₹${remaining.toLocaleString("en-IN")}.`;
      } else if (remaining === 0) {
        fastInsight += "Your monthly budget is 100% balanced with zero deficit.";
      } else {
        fastInsight += `Warning: Planned spending exceeds income by ₹${Math.abs(remaining).toLocaleString("en-IN")}.`;
      }

      setResults({
        totalPlanned,
        remaining,
        savingsAmount,
        savingsPercent,
        aiInsight: fastInsight,
      });

      setIsCalculating(false);
      setShowCompleteNotification(true);

      setAiLoading(true);
      fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: parsedIncome, categories: sanitizedCategories }),
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
        .catch((err) => console.error("Background budget AI fetch:", err))
        .finally(() => setAiLoading(false));
    }, 900);
  };

  const handleUseSampleData = () => {
    setIncome(30000);
    const sample = [
      { name: "Housing / Bills", amount: 8000, color: "#1D4ED8" },
      { name: "Food & Groceries", amount: 4000, color: "#059669" },
      { name: "Transport", amount: 2000, color: "#0284C7" },
      { name: "Education", amount: 3000, color: "#7C3AED" },
      { name: "Shopping", amount: 2000, color: "#D97706" },
      { name: "Entertainment", amount: 1000, color: "#DB2777" },
      { name: "Savings Buffer", amount: 6000, color: "#0D9488" },
      { name: "Emergency Fund", amount: 2000, color: "#4F46E5" },
      { name: "Other Expenses", amount: 0, color: "#94A3B8" },
    ];
    setCategories(sample);
    setShowCompleteNotification(false);
    setResults({
      totalPlanned: 28000,
      remaining: 2000,
      savingsAmount: 6000,
      savingsPercent: 20,
      aiInsight: "Your planned budget leaves ₹2,000 unallocated. You could keep this as a buffer or add it to your emergency savings.",
    });
  };

  const handleReset = () => {
    setIncome("");
    setCategories(DEFAULT_CATEGORIES.map((c) => ({ ...c, amount: "" })));
    setShowCompleteNotification(false);
    setResults({
      totalPlanned: 0,
      remaining: 0,
      savingsAmount: 0,
      savingsPercent: 0,
      aiInsight: "Enter your monthly income and category allocations to calculate your budget.",
    });
  };

  const handleExplainResult = async () => {
    if (!results) return;
    setExplainLoading(true);
    setShowExplainModal(true);
    setExplanationText("");

    const parsedIncome = typeof income === "number" ? income : parseFloat(income) || 0;
    const contextStr = `Smart Budget Plan:\n- Income: ₹${parsedIncome}\n- Total Planned: ₹${results.totalPlanned}\n- Remaining: ₹${results.remaining}\n- Savings: ₹${results.savingsAmount} (${results.savingsPercent}%)\n- Categories:\n${categories.filter(c => Number(c.amount) > 0).map(c => `  * ${c.name}: ₹${c.amount}`).join("\n")}`;

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
        throw new Error(json.error || "Failed to generate explanation.");
      }
    } catch (err: any) {
      console.error(err);
      setExplanationText("Your budget plan calculates total planned spending against your monthly income to identify unallocated funds.");
    } finally {
      setExplainLoading(false);
    }
  };

  const numIncome = typeof income === "number" ? income : (parseFloat(String(income)) || 0);
  const pieData = categories
    .map((c) => ({
      name: c.name,
      amount: typeof c.amount === "number" ? c.amount : (parseFloat(String(c.amount)) || 0),
      color: c.color,
    }))
    .filter((c) => c.amount > 0);

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
                Smart Budget Allocator
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Cashflow Organizer
              </span>
            </div>
            <p className="text-xs text-secondary-text font-medium mt-0.5">
              Plan where your money goes with categorized monthly envelope allocations.
            </p>
          </div>
        </div>

        <button
          onClick={handleUseSampleData}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span>Use Sample Data</span>
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
                Budget Allocation Calculated Successfully!
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Total Planned: <strong>₹{results.totalPlanned.toLocaleString("en-IN")}</strong> • Buffer: <strong>₹{results.remaining.toLocaleString("en-IN")}</strong>
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
        {/* Form Column (Span 3) */}
        <form
          onSubmit={handleCalculate}
          className={`bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between ${
            mode === "kiosk" ? "col-span-3" : "col-span-1"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Monthly Income & Categories
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                9 Categories
              </span>
            </div>

            {/* Income field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Monthly Income
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
                  className="w-full h-11 pl-8 pr-4 kiosk-input font-bold text-sm bg-slate-50/50 font-mono"
                  placeholder="30000"
                  required
                />
              </div>
            </div>

            {/* Categories Inputs Grid */}
            <div className={`grid gap-3 max-h-72 overflow-y-auto pr-1 ${mode === "kiosk" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              {categories.map((cat, idx) => {
                const numericVal = typeof cat.amount === "number" ? cat.amount : (parseFloat(String(cat.amount)) || 0);
                const percent = numIncome > 0 ? Math.round((numericVal / numIncome) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-muted-text font-mono">
                        {percent}%
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={cat.amount}
                        onChange={(e) => handleCategoryChange(idx, e.target.value)}
                        className="w-full h-9 pl-6 pr-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
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
                  <span>Analyzing Allocations...</span>
                </div>
              ) : (
                <span>CALCULATE BUDGET</span>
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

        {/* Results Panel (Span 2) */}
        <div className={`space-y-6 flex flex-col justify-between ${mode === "kiosk" ? "col-span-2" : "col-span-1"}`}>
          <div className="bg-white border border-border/90 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Allocation Breakdown
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

            <div className="space-y-4">
              {/* Output cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-muted-text uppercase">
                    Total Planned
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                    ₹{results.totalPlanned.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-muted-text uppercase">
                    Unallocated Buffer
                  </span>
                  <p
                    className={`text-base font-black mt-0.5 font-mono ${
                      results.remaining >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    ₹{results.remaining.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Pie Donut Chart */}
              {pieData.length > 0 && (
                <div className="h-40 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
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
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 border border-amber-200/70 p-5 rounded-2xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 animate-pulse-slow" />
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                    AI Budget Recommendations
                  </span>
                </div>
                {aiLoading && (
                  <span className="text-[10px] text-amber-700 font-bold animate-pulse">
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
              <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  AI Budget Allocation Analysis
                </h3>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                  Smart Bank Financial Intelligence Engine
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl min-h-[100px] flex items-center justify-center">
              {explainLoading ? (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Generating budget breakdown explanation...</p>
                </div>
              ) : (
                <CleanAIResponse text={explanationText} className="w-full" />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-muted-text font-medium">
                Educational planning tool.
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
