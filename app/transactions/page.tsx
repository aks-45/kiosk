"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, AlertCircle, RefreshCcw } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTransactions() {
    try {
      setIsLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams();
      if (filterType !== "ALL") {
        queryParams.set("type", filterType);
      }
      if (search.trim() !== "") {
        queryParams.set("query", search);
      }

      const res = await fetch(`/api/transactions?${queryParams.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        setTransactions(json.transactions);
      } else {
        throw new Error(json.error || "Failed to load transactions.");
      }
    } catch (err: any) {
      console.error("Transactions lookup error:", err);
      setError(err.message || "Could not retrieve ledger activity.");
    } finally {
      setIsLoading(false);
    }
  }

  // Trigger search / filters fetch
  useEffect(() => {
    // Small debounce for keyboard inputs
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterType]);

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-secondary-text" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-main-text">
              Transaction History
            </h1>
            <p className="text-xs text-secondary-text font-medium">
              Simulated statement of ledger movements
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          className="p-2 border border-border rounded-xl bg-white hover:bg-slate-50 transition-all text-slate-500 cursor-pointer"
          title="Reload Statements"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 kiosk-input text-xs font-semibold"
            placeholder="Search by description or category (e.g. Grocery, Bill)..."
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === "ALL"
                ? "bg-white text-primary-blue shadow-sm border border-slate-200"
                : "text-secondary-text hover:text-main-text"
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilterType("CREDIT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === "CREDIT"
                ? "bg-white text-green shadow-sm border border-slate-200"
                : "text-secondary-text hover:text-main-text"
            }`}
          >
            Credits (+)
          </button>
          <button
            onClick={() => setFilterType("DEBIT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === "DEBIT"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                : "text-secondary-text hover:text-main-text"
            }`}
          >
            Debits (-)
          </button>
        </div>
      </div>

      {/* Statement Sheet Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-10 h-10 border-4 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-border rounded-2xl text-center">
          <AlertCircle className="h-10 w-10 text-red mb-3" />
          <h3 className="font-bold text-main-text text-sm">Failed to retrieve statements</h3>
          <p className="text-xs text-secondary-text mt-1">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-2xl text-center">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="font-bold text-main-text text-sm">No transaction matches</h3>
          <p className="text-xs text-secondary-text mt-1">
            Try adjusting your search keywords or transaction filters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop/Landscape Table Header (shown only when screen is wide) */}
          <div className="hidden sm:grid grid-cols-5 px-6 py-3.5 border-b border-border bg-slate-50/50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <div>Date</div>
            <div className="col-span-2">Description</div>
            <div>Category</div>
            <div className="text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isDebit = tx.type === "DEBIT";
              const formattedDate = new Date(tx.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-1 sm:grid-cols-5 px-6 py-4 items-center gap-2 hover:bg-slate-50/30 transition-all"
                >
                  {/* Date Column */}
                  <div className="text-[11px] font-bold text-secondary-text">
                    {formattedDate}
                  </div>

                  {/* Description Column */}
                  <div className="col-span-2 text-xs font-bold text-main-text">
                    {tx.description}
                  </div>

                  {/* Category Tag Column */}
                  <div>
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      {tx.category}
                    </span>
                  </div>

                  {/* Amount Column */}
                  <div
                    className={`text-right text-sm font-black ${
                      isDebit ? "text-slate-800" : "text-green"
                    }`}
                  >
                    {isDebit ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security note disclaimer */}
      <div className="text-[11px] text-slate-400 font-medium text-center">
        Demo statement log — simulated database inputs. Transactions are purely for interactive demonstration.
      </div>
    </div>
  );
}
