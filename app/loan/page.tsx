"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, RotateCcw, Info, Landmark, HelpCircle } from "lucide-react";
import { useDeviceMode } from "@/lib/device-mode-context";

export default function LoanPage() {
  const { mode } = useDeviceMode();
  const [principal, setPrincipal] = useState<number | string>(200000); // ₹2,00,000
  const [interestRate, setInterestRate] = useState<number | string>(10); // 10%
  const [durationYears, setDurationYears] = useState<number | string>(5); // 5 Years

  const [results, setResults] = useState<{
    monthlyEMI: number;
    totalInterest: number;
    totalRepayment: number;
  } | null>({
    monthlyEMI: 4249,
    totalInterest: 54964,
    totalRepayment: 254964,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const parsedPrincipal = typeof principal === "number" ? principal : parseFloat(principal) || 0;
    const parsedRate = typeof interestRate === "number" ? interestRate : parseFloat(interestRate) || 0;
    const parsedYears = typeof durationYears === "number" ? durationYears : parseInt(durationYears) || 1;

    if (parsedPrincipal <= 0) {
      setError("Please enter a valid loan amount greater than 0.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principal: parsedPrincipal,
          interestRate: parsedRate,
          durationYears: parsedYears,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResults({
          monthlyEMI: json.monthlyEMI,
          totalInterest: json.totalInterest,
          totalRepayment: json.totalRepayment,
        });
      } else {
        throw new Error(json.error || "EMI calculation error.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to compile loan calculations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrincipal(200000);
    setInterestRate(10);
    setDurationYears(5);
    setResults({
      monthlyEMI: 4249,
      totalInterest: 54964,
      totalRepayment: 254964,
    });
    setError("");
  };

  const numPrincipal = typeof principal === "number" ? principal : parseFloat(String(principal)) || 0;
  const numRate = typeof interestRate === "number" ? interestRate : parseFloat(String(interestRate)) || 0;
  const numYears = typeof durationYears === "number" ? durationYears : parseInt(String(durationYears)) || 1;

  const interestPercentage =
    results && results.totalRepayment > 0
      ? Math.round((results.totalInterest / results.totalRepayment) * 100)
      : 0;

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
              Loan & EMI Calculator
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
              Amortization Engine
            </span>
          </div>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            Interactive financial simulator for borrowing rates, monthly EMIs & total interest.
          </p>
        </div>
      </div>

      {/* Calculator Body Split */}
      <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-5" : "grid-cols-1"}`}>
        {/* Form Inputs (Span 3) */}
        <form
          onSubmit={handleCalculate}
          className={`bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6 flex flex-col justify-between ${
            mode === "kiosk" ? "col-span-3" : "col-span-1"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Loan Parameters
              </h3>
              <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-full font-bold">
                Dynamic Sliders
              </span>
            </div>

            {/* Amount Slider & Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Loan Principal (P)</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrincipal(val === "" ? "" : Number(val));
                    }}
                    className="w-36 h-9 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900 text-right"
                  />
                </div>
              </div>
              <input
                type="range"
                min={10000}
                max={2500000}
                step={5000}
                value={numPrincipal}
                onChange={(e) => setPrincipal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
              />
              <div className="flex justify-between text-[10px] text-muted-text font-bold">
                <span>₹10,000</span>
                <span>₹25 Lakhs</span>
              </div>
            </div>

            {/* Interest Slider & Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Annual Interest Rate (r)</span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInterestRate(val === "" ? "" : Number(val));
                    }}
                    className="w-24 h-9 pr-6 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-teal-700 text-right"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={numRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[10px] text-muted-text font-bold">
                <span>0% (Interest-Free)</span>
                <span>25% p.a.</span>
              </div>
            </div>

            {/* Duration Slider & Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Tenure Duration (n)</span>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={durationYears}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDurationYears(val === "" ? "" : Number(val));
                    }}
                    className="w-28 h-9 pr-14 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-purple-700 text-right"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    Years
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={numYears}
                onChange={(e) => setDurationYears(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple"
              />
              <div className="flex justify-between text-[10px] text-muted-text font-bold">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? "CALCULATING..." : "RECALCULATE EMI"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer"
              title="Reset Parameters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Results Visuals (Span 2) */}
        <div className={`bg-white border border-border/90 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6 flex flex-col justify-between ${
          mode === "kiosk" ? "col-span-2" : "col-span-1"
        }`}>
          <div className="space-y-6">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-border/70 pb-3">
              Repayment Analysis
            </h3>

            {/* Main Calculated EMI Card */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 rounded-2xl border border-blue-200/60 text-center space-y-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-primary-blue">
                Monthly Repayment (EMI)
              </span>
              <h2 className="text-3xl font-black text-slate-900 font-mono">
                ₹{results?.monthlyEMI.toLocaleString("en-IN")}
              </h2>
              <span className="text-[10px] text-muted-text font-bold">
                per calendar month
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-100">
                <span className="text-slate-500">Principal Amount:</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{numPrincipal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Interest Payable:</span>
                <span className="font-bold font-mono text-teal-700">
                  +₹{results?.totalInterest.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold py-1">
                <span className="text-slate-500">Total Amount Payable:</span>
                <span className="font-black font-mono text-slate-900 text-sm">
                  ₹{results?.totalRepayment.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10.5px] font-bold">
                <span className="text-primary-blue">Principal ({100 - interestPercentage}%)</span>
                <span className="text-teal-700">Interest ({interestPercentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-teal-500 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-primary-blue transition-all duration-300"
                  style={{ width: `${100 - interestPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl flex items-start gap-2.5">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-muted-text leading-relaxed font-medium">
              EMI is computed deterministically using standard reducing balance amortization formula.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
