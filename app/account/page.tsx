"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, PiggyBank, AlertCircle, Info, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDeviceMode } from "@/lib/device-mode-context";

interface AccountData {
  customerId: string;
  name: string;
  balance: number;
  savingsBalance: number;
  pendingBalance: number;
}

interface TransactionData {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  date: string;
}

export default function AccountPage() {
  const { mode } = useDeviceMode();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError("");

        const accRes = await fetch("/api/account");
        const accJson = await accRes.json();
        if (accJson.success) {
          setAccount(accJson.user);
        } else {
          throw new Error(accJson.error || "Failed to load account data.");
        }

        const txRes = await fetch("/api/transactions");
        const txJson = await txRes.json();
        if (txJson.success) {
          setTransactions(txJson.transactions);
        }
      } catch (err: any) {
        console.error("Error fetching account data:", err);
        setError(err.message || "Could not retrieve account details.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const chartData = [
    { name: "Week 1", Income: 30000, Spending: 8000, Balance: 22000 },
    { name: "Week 2", Income: 0, Spending: 4500, Balance: 17500 },
    { name: "Week 3", Income: 150, Spending: 399, Balance: 17251 },
    { name: "Week 4", Income: 0, Spending: 5551, Balance: 25430 },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "CREDIT") return tx.type === "CREDIT";
    if (filterType === "DEBIT") return tx.type === "DEBIT";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-secondary-text">Loading Account & Ledger Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Connection Issue</h2>
        <p className="text-xs text-secondary-text mt-1 max-w-sm">{error}</p>
        <Link
          href="/dashboard"
          className="mt-6 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Title header */}
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
              Account & Activity
            </h1>
            <span className="text-[10px] font-extrabold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
              SB-849201
            </span>
          </div>
          <p className="text-xs text-secondary-text font-medium mt-0.5">
            Primary Savings Account • Account Holder: {account?.name || "Aarav Sharma"}
          </p>
        </div>
      </div>

      {/* Overview Grid: 4 Metric Cards */}
      <div className={`grid gap-3 sm:gap-4 ${mode === "kiosk" ? "grid-cols-4" : "grid-cols-2"}`}>
        {/* Total Balance Card */}
        <div className="bg-white border border-border/90 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[120px] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-muted-text uppercase tracking-wider">
              Total Balance
            </span>
            <div className="p-2 bg-blue-50 text-primary-blue rounded-xl border border-blue-100">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-mono">
              ₹{account?.balance.toLocaleString("en-IN")}
            </h2>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available Clear Funds
            </span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-white border border-border/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-34 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-muted-text uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-600 font-mono">
              +₹30,000
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Salary Credit & Yields
            </span>
          </div>
        </div>

        {/* Monthly Spending Card */}
        <div className="bg-white border border-border/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-34 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-muted-text uppercase tracking-wider">
              Monthly Spending
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-mono">
              -₹18,450
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Rent, Bills & Groceries
            </span>
          </div>
        </div>

        {/* Savings Buffer Card */}
        <div className="bg-white border border-border/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-34 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-muted-text uppercase tracking-wider">
              Savings Buffer
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-purple-700 font-mono">
              ₹{account?.savingsBalance.toLocaleString("en-IN")}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Liquid Reserve Fund
            </span>
          </div>
        </div>
      </div>

      {/* Main split: Visual Chart + Recent Activity */}
      <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-5" : "grid-cols-1"}`}>
        {/* Cash Flow Chart (Span 3) */}
        <div className={`bg-white border border-border/90 p-6 rounded-2xl shadow-xs space-y-4 ${mode === "kiosk" ? "col-span-3" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Income vs. Spending Trajectory
              </h3>
              <p className="text-[11px] text-secondary-text font-medium">
                Monthly ledger flow and cash balance progression
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-slate-600 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Info className="h-3 w-3 text-slate-400" />
              Real-time Simulation
            </span>
          </div>

          <div className="h-60 w-full text-xs pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    color: "#F8FAFC",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "11px",
                    fontWeight: "bold",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Balance"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List (Span 2) */}
        <div className={`bg-white border border-border/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 ${mode === "kiosk" ? "col-span-2" : ""}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <h3 className="font-extrabold text-sm text-slate-900">Recent Activity</h3>
              <div className="flex gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("CREDIT")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    filterType === "CREDIT" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setFilterType("DEBIT")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    filterType === "DEBIT" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Debits
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredTransactions.map((tx) => {
                const isDebit = tx.type === "DEBIT";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDebit
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-primary-blue transition-colors">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-text font-medium">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold text-[9px] uppercase tracking-wide">
                            {tx.category}
                          </span>
                          <span>
                            {new Date(tx.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold font-mono shrink-0 ${
                        isDebit ? "text-slate-900" : "text-emerald-600"
                      }`}
                    >
                      {isDebit ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="py-8 text-center text-xs text-secondary-text font-medium">
                  No matching transactions found.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10.5px] text-muted-text font-bold text-center">
            SMART BANK SECURE LEDGER
          </div>
        </div>
      </div>
    </div>
  );
}
