"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeviceMode } from "@/lib/device-mode-context";
import {
  ArrowLeft,
  PiggyBank,
  Send,
  HandCoins,
  TrendingUp,
  Building2,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Bot,
  Search,
  Scale,
  X,
  ChevronRight,
  ShieldAlert,
  Calculator,
  Info,
} from "lucide-react";

// Category type definitions
type CategoryId = "save" | "send" | "borrow" | "invest" | "account" | "learn";

interface CategoryOption {
  id: CategoryId;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badge: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "save",
    title: "Save Money & Deposits",
    subtitle: "Understand savings accounts, Fixed Deposits (FD), and Recurring Deposits (RD)",
    icon: PiggyBank,
    color: "bg-white hover:border-teal-500/40 hover:shadow-md",
    badge: "Savings & Deposits",
  },
  {
    id: "send",
    title: "Send & Transfer Money",
    subtitle: "Compare UPI, NEFT, RTGS & IMPS transfers speed and limits",
    icon: Send,
    color: "bg-white hover:border-blue-500/40 hover:shadow-md",
    badge: "Digital Transfers",
  },
  {
    id: "borrow",
    title: "Borrow & Credit",
    subtitle: "Personal, education, home loans & EMI amortization principles",
    icon: HandCoins,
    color: "bg-white hover:border-purple-500/40 hover:shadow-md",
    badge: "Loans & Credit",
  },
  {
    id: "invest",
    title: "Invest & Grow Wealth",
    subtitle: "Low-risk savings options, mutual fund basics & compounding",
    icon: TrendingUp,
    color: "bg-white hover:border-emerald-500/40 hover:shadow-md",
    badge: "Wealth & Growth",
  },
  {
    id: "account",
    title: "Account Types",
    subtitle: "Savings, current, salary & student account structures",
    icon: Building2,
    color: "bg-white hover:border-indigo-500/40 hover:shadow-md",
    badge: "Account Types",
  },
  {
    id: "learn",
    title: "Banking Glossary",
    subtitle: "Searchable encyclopedia of banking terms, KYC, IFSC & UPI",
    icon: BookOpen,
    color: "bg-white hover:border-sky-500/40 hover:shadow-md",
    badge: "Glossary",
  },
];

// Glossary terms database
interface GlossaryTerm {
  term: string;
  fullName?: string;
  definition: string;
  example?: string;
  tag: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "KYC",
    fullName: "Know Your Customer",
    definition: "A standard identity verification process banks use to verify customer identity and address documents before opening accounts.",
    example: "Providing Aadhar card, PAN card, or passport during account opening.",
    tag: "Security & Verification",
  },
  {
    term: "IFSC",
    fullName: "Indian Financial System Code",
    definition: "An 11-character alphanumeric code used to uniquely identify a specific bank branch for electronic money transfers in India.",
    example: "SBIN0001234 represents a specific SBI branch.",
    tag: "Bank Transfers",
  },
  {
    term: "UPI",
    fullName: "Unified Payments Interface",
    definition: "An instant real-time payment system developed by NPCI that allows interbank peer-to-peer and person-to-merchant transactions via mobile.",
    example: "Scanning a QR code at a grocery store to pay instantly.",
    tag: "Digital Payments",
  },
  {
    term: "NEFT",
    fullName: "National Electronic Funds Transfer",
    definition: "A nationwide batch-based electronic payment system enabling individuals to transfer funds between bank accounts across India.",
    example: "Transferring monthly rent to a landlord's bank account.",
    tag: "Bank Transfers",
  },
  {
    term: "RTGS",
    fullName: "Real Time Gross Settlement",
    definition: "A continuous, real-time fund settlement system designed primarily for high-value transactions (typically ₹2 Lakh and above).",
    example: "A company transferring ₹5 Lakhs to a supplier immediately.",
    tag: "Bank Transfers",
  },
  {
    term: "IMPS",
    fullName: "Immediate Payment Service",
    definition: "An instant 24x7 interbank electronic fund transfer service accessible through mobile phones, internet banking, and ATMs.",
    example: "Sending urgent money to a relative on a bank holiday.",
    tag: "Digital Payments",
  },
  {
    term: "FD",
    fullName: "Fixed Deposit",
    definition: "A financial instrument provided by banks that provides investors a higher rate of interest than a regular savings account until a given maturity date.",
    example: "Depositing ₹50,000 for 1 year at 6.5% interest rate.",
    tag: "Savings & Deposits",
  },
  {
    term: "RD",
    fullName: "Recurring Deposit",
    definition: "A investment option that allows people to deposit a fixed amount every month for a specified period while earning fixed interest returns.",
    example: "Saving ₹2,000 every month for 12 months.",
    tag: "Savings & Deposits",
  },
  {
    term: "Interest",
    definition: "The money paid by a borrower to a lender for using their money, or paid by a bank to a saver for keeping their deposit in the bank.",
    example: "Earning 3.5% annually on your savings account balance.",
    tag: "General Finance",
  },
  {
    term: "Inflation",
    definition: "The gradual rate at which the general level of prices for goods and services rises, eroding the purchasing power of money over time.",
    example: "If inflation is 5%, an item costing ₹100 today will cost ₹105 next year.",
    tag: "General Finance",
  },
  {
    term: "EMI",
    fullName: "Equated Monthly Instalment",
    definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month to repay both loan principal and interest.",
    example: "Paying ₹8,500 every month for a 3-year personal loan.",
    tag: "Loans & Credit",
  },
  {
    term: "Savings Account",
    definition: "A basic interest-bearing bank account intended for individuals to hold, manage, and access daily cash liquid reserves securely.",
    example: "Keeping money for monthly groceries and utility bill payments.",
    tag: "Account Types",
  },
  {
    term: "Current Account",
    definition: "A non-interest bearing deposit account designed for business owners and firms carrying out a large volume of daily money transactions.",
    example: "A retail shop owner using an account for high daily cash receipts.",
    tag: "Account Types",
  },
];

export default function SmartBankingGuidePage() {
  const { mode } = useDeviceMode();
  const router = useRouter();

  // Navigation & Flow State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  
  // Results & Modals
  const [resultsData, setResultsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);

  // Glossary search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(GLOSSARY_TERMS[0]);

  // Handle Category Selection
  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setStepIndex(0);
    setUserAnswers({});
    setResultsData(null);

    // If glossary term selection, no questions needed
    if (catId === "learn") {
      setSelectedGlossaryTerm(GLOSSARY_TERMS[0]);
    }
  };

  // Flow Questions Configuration
  const getQuestions = () => {
    if (selectedCategory === "save") {
      return [
        {
          key: "timeHorizon",
          question: "When might you need the money?",
          options: [
            { label: "Very soon (within months)", value: "soon", subtext: "Need quick liquidity" },
            { label: "Within 1–3 years", value: "medium", subtext: "Medium term planned goal" },
            { label: "Long term (3+ years)", value: "long", subtext: "Long term wealth building" },
          ],
        },
        {
          key: "accessNeed",
          question: "Do you need regular access to the money?",
          options: [
            { label: "Yes, anytime access", value: "yes", subtext: "High liquidity preference" },
            { label: "Not necessarily", value: "not-necessarily", subtext: "Can lock funds for higher returns" },
          ],
        },
      ];
    }

    if (selectedCategory === "send") {
      return [
        {
          key: "sendGoal",
          question: "What are you trying to do?",
          options: [
            { label: "Send money to another person", value: "p2p", subtext: "Instant small/medium peer payments" },
            { label: "Pay a business or merchant", value: "p2m", subtext: "Shopping, bills, QR codes" },
            { label: "Transfer a larger amount", value: "high-value", subtext: "Bank-to-bank high value transfers" },
            { label: "Learn about digital transfers", value: "learn-modes", subtext: "Compare UPI, NEFT, RTGS, IMPS" },
          ],
        },
      ];
    }

    if (selectedCategory === "borrow") {
      return [
        {
          key: "borrowTopic",
          question: "What do you want to understand?",
          options: [
            { label: "Personal loan", value: "personal", subtext: "Unsecured personal financing" },
            { label: "Education loan", value: "education", subtext: "Studies & tuition funding" },
            { label: "Home loan", value: "home", subtext: "Housing purchase or building" },
            { label: "Loan basics & repayment", value: "basics", subtext: "How interest & tenure work" },
            { label: "Interest and EMI calculation", value: "emi", subtext: "Understanding EMI structures" },
          ],
        },
      ];
    }

    if (selectedCategory === "invest") {
      return [
        {
          key: "investTopic",
          question: "What are you trying to understand?",
          options: [
            { label: "Low-risk savings options", value: "low-risk", subtext: "Capital protection options" },
            { label: "Long-term investing principles", value: "long-term", subtext: "Compounding & time horizon" },
            { label: "Fixed-income concepts", value: "fixed-income", subtext: "Bonds & fixed returns" },
            { label: "Mutual fund basics", value: "mutual-funds", subtext: "Pooled investments & SIPs" },
            { label: "Learn about risk & inflation", value: "risk", subtext: "Market fluctuations & purchasing power" },
          ],
        },
      ];
    }

    if (selectedCategory === "account") {
      return [
        {
          key: "accountType",
          question: "What type of account are you interested in?",
          options: [
            { label: "Savings Account", value: "savings", subtext: "Personal daily banking & interest" },
            { label: "Current Account", value: "current", subtext: "Business transactions & high volume" },
            { label: "Salary Account", value: "salary", subtext: "Payroll credits & employer perks" },
            { label: "Student Account", value: "student", subtext: "Low minimum balance & learning" },
          ],
        },
      ];
    }

    return [];
  };

  const currentQuestions = getQuestions();

  // Handle Question Choice Selection
  const handleAnswerSelect = (key: string, value: string) => {
    const nextAnswers = { ...userAnswers, [key]: value };
    setUserAnswers(nextAnswers);

    if (stepIndex + 1 < currentQuestions.length) {
      setStepIndex(stepIndex + 1);
    } else {
      // Flow completed — Submit answers to backend endpoint
      fetchGuideResults(selectedCategory!, nextAnswers);
    }
  };

  // Fetch Results from API
  const fetchGuideResults = async (cat: CategoryId, answers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/banking-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, answers }),
      });
      const json = await res.json();
      if (json.success) {
        setResultsData(json);
      }
    } catch (err) {
      console.error("Guide fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Launch AI with pre-loaded contextual prompt
  const handleAskAI = (contextSummary?: string) => {
    let prompt = "";
    if (selectedCategory === "save") {
      prompt = `The user is exploring saving options (Time horizon: ${userAnswers.timeHorizon || "flexible"}, Access need: ${userAnswers.accessNeed || "moderate"}). Explain the basic differences between Savings Accounts, Fixed Deposits, and Recurring Deposits in simple, educational language.`;
    } else if (selectedCategory === "send") {
      prompt = `The user is exploring digital money transfer options (Goal: ${userAnswers.sendGoal || "digital payments"}). Explain how UPI, NEFT, RTGS, and IMPS work in simple educational terms, highlighting speed and limits.`;
    } else if (selectedCategory === "borrow") {
      prompt = `The user is exploring borrowing options (${userAnswers.borrowTopic || "loan concepts"}). Explain the basic concept of loans, interest, and EMI calculations in simple educational language.`;
    } else if (selectedCategory === "invest") {
      prompt = `The user is learning about investing (${userAnswers.investTopic || "wealth concepts"}). Explain the relationship between risk, returns, and inflation in simple educational terms.`;
    } else if (selectedCategory === "account") {
      prompt = `The user is exploring bank account types (${userAnswers.accountType || "accounts"}). Explain the primary differences between Savings Accounts, Current Accounts, Salary Accounts, and Student Accounts.`;
    } else if (selectedCategory === "learn" && selectedGlossaryTerm) {
      prompt = `Please explain the banking term "${selectedGlossaryTerm.term}" (${selectedGlossaryTerm.fullName || selectedGlossaryTerm.term}) in simple, easy-to-understand language with a real-life example.`;
    } else {
      prompt = `Explain key banking options and decision principles for everyday financial management.`;
    }

    router.push(`/ai?prompt=${encodeURIComponent(prompt)}`);
  };

  // Filtered glossary list
  const filteredGlossary = GLOSSARY_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.fullName && t.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* Title Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-secondary-text" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Decision Support Service
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-main-text flex items-center gap-2">
              <span>SMART BANKING GUIDE</span>
            </h1>
            <p className="text-xs text-secondary-text font-semibold">
              &ldquo;Tell us what you want to do, and we&apos;ll help you understand the available banking options.&rdquo;
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setStepIndex(0);
              setUserAnswers({});
              setResultsData(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Guide</span>
          </button>
        )}
      </div>

      {/* NON-REAL-BANK DISCLAIMER BANNER */}
      <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-semibold">
          <Info className="h-4 w-4 text-primary-blue shrink-0" />
          <span>
            <strong>Educational Decision-Support:</strong> This guide explains general banking concepts. It does not provide regulated advice, open accounts, or approve loans.
          </span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 hidden sm:inline">
          Kiosk Education
        </span>
      </div>

      {/* STATE 1: MAIN CATEGORY SELECTION */}
      {!selectedCategory && (
        <div className="space-y-5">
          <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-1">
              Main Question
            </h2>
            <p className="text-xl font-black tracking-tight text-main-text">
              WHAT WOULD YOU LIKE HELP WITH?
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Select an option below to explore relevant banking concepts and interactive explanations.
            </p>
          </div>

          <div
            className={`grid gap-4 ${
              mode === "kiosk" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`group relative text-left p-6 bg-white border-2 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${cat.color}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base tracking-tight text-main-text group-hover:text-primary-blue transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-secondary-text mt-1 font-semibold leading-relaxed">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-primary-blue">
                    <span>EXPLORE OPTION</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STATE 2: INTERACTIVE QUESTIONNAIRE FLOW */}
      {selectedCategory && selectedCategory !== "learn" && !resultsData && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>
              STEP {stepIndex + 1} OF {currentQuestions.length}
            </span>
            <span className="uppercase text-[10px] text-primary-blue font-extrabold bg-light-blue px-2.5 py-0.5 rounded-full border border-primary-blue/15">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-blue h-full transition-all duration-300"
              style={{
                width: `${((stepIndex + 1) / currentQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Question Card */}
          {currentQuestions[stepIndex] && (
            <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                  Question {stepIndex + 1}
                </h3>
                <p className="text-xl font-black text-main-text tracking-tight">
                  &ldquo;{currentQuestions[stepIndex].question}&rdquo;
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestions[stepIndex].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleAnswerSelect(
                        currentQuestions[stepIndex].key,
                        opt.value
                      )
                    }
                    className="w-full text-left p-4 bg-slate-50 border border-slate-200 hover:border-primary-blue hover:bg-light-blue/40 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <p className="font-black text-sm text-main-text group-hover:text-primary-blue">
                        {opt.label}
                      </p>
                      <p className="text-xs text-secondary-text font-medium mt-0.5">
                        {opt.subtext}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-blue group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white border border-border p-8 rounded-2xl shadow-sm text-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto" />
              <p className="text-xs font-black text-slate-700">
                Analyzing choices & matching relevant options...
              </p>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: RESULTS SCREEN */}
      {selectedCategory && resultsData && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Banner */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 border border-teal-200 text-teal-600 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-main-text uppercase">
                    YOUR BANKING GUIDE RESULT
                  </h2>
                  <p className="text-xs text-secondary-text font-semibold">
                    Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setResultsData(null);
                  setStepIndex(0);
                }}
                className="px-3 py-1.5 text-xs font-extrabold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Change Choices
              </button>
            </div>

            <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1">
              <p className="text-xs font-black text-teal-800 uppercase tracking-wider">
                Summary
              </p>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                {resultsData.summary}
              </p>
            </div>
          </div>

          {/* BASED ON YOUR ANSWERS - OPTIONS GRID */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span>BASED ON YOUR ANSWERS — Options you may want to learn about</span>
            </h3>

            <div
              className={`grid gap-4 ${
                mode === "kiosk" ? "grid-cols-3" : "grid-cols-1"
              }`}
            >
              {resultsData.options?.map((opt: any) => (
                <div
                  key={opt.id}
                  className="bg-white border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-blue bg-light-blue px-2.5 py-0.5 rounded-full border border-primary-blue/15">
                        {opt.accessLevel} Access
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Concept
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-base text-main-text">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {opt.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      &ldquo;{opt.description}&rdquo;
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                      {opt.features?.map((feat: string, i: number) => (
                        <li
                          key={i}
                          className="text-[11px] text-slate-600 font-medium flex items-start gap-1.5"
                        >
                          <span className="text-teal-500 font-black">•</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                    <span className="text-slate-400 font-extrabold uppercase block text-[9px]">
                      Suitable for:
                    </span>
                    <span>{opt.suitableFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY THESE OPTIONS? */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary-blue" />
              <span>WHY THESE OPTIONS?</span>
            </h3>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {resultsData.whyExplanation}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex-1 h-12 bg-white border border-border hover:border-primary-blue text-main-text font-black text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scale className="h-4.5 w-4.5 text-primary-blue" />
              <span>COMPARE OPTIONS</span>
            </button>

            {selectedCategory === "borrow" && (
              <button
                onClick={() => setShowEmiModal(true)}
                className="flex-1 h-12 bg-purple-50 border border-purple-200 text-purple-700 font-black text-xs rounded-xl shadow-xs hover:bg-purple-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="h-4.5 w-4.5 text-purple-600" />
                <span>UNDERSTAND EMI</span>
              </button>
            )}

            <button
              onClick={() => handleAskAI(resultsData.summary)}
              className="flex-1 h-12 bg-primary-blue text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-primary-blue/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="h-4.5 w-4.5" />
              <span>ASK SMART BANK AI</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory(null);
                setStepIndex(0);
                setUserAnswers({});
                setResultsData(null);
              }}
              className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>START AGAIN</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: LEARN ABOUT BANKING (SEARCHABLE GLOSSARY) */}
      {selectedCategory === "learn" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black tracking-tight text-main-text uppercase flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-600" />
                <span>SEARCHABLE BANKING GLOSSARY</span>
              </h2>
              <p className="text-xs text-secondary-text font-semibold mt-1">
                Explore key financial acronyms, banking definitions, and terms in plain language.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search term e.g. KYC, IFSC, UPI, EMI, Inflation..."
                className="w-full h-11 pl-10 pr-4 kiosk-input font-bold text-xs"
              />
            </div>
          </div>

          <div className={`grid gap-6 ${mode === "kiosk" ? "grid-cols-3" : "grid-cols-1"}`}>
            {/* Terms List (1 Col) */}
            <div className="bg-white border border-border rounded-2xl shadow-sm p-4 space-y-2 max-h-[420px] overflow-y-auto">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                Glossary Terms ({filteredGlossary.length})
              </p>
              {filteredGlossary.map((item) => (
                <button
                  key={item.term}
                  onClick={() => setSelectedGlossaryTerm(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedGlossaryTerm?.term === item.term
                      ? "bg-primary-blue text-white border-primary-blue font-black shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div>
                    <p className="text-xs font-black">{item.term}</p>
                    {item.fullName && (
                      <p
                        className={`text-[10px] font-medium truncate max-w-[170px] ${
                          selectedGlossaryTerm?.term === item.term
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        {item.fullName}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 ${
                      selectedGlossaryTerm?.term === item.term
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Term Details View (2 Cols) */}
            <div className={`bg-white border border-border rounded-2xl shadow-sm p-6 space-y-6 flex flex-col justify-between ${
              mode === "kiosk" ? "col-span-2" : "col-span-1"
            }`}>
              {selectedGlossaryTerm ? (
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-slate-100 pb-4">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full">
                      {selectedGlossaryTerm.tag}
                    </span>
                    <h3 className="text-2xl font-black text-main-text tracking-tight mt-2">
                      {selectedGlossaryTerm.term}
                    </h3>
                    {selectedGlossaryTerm.fullName && (
                      <p className="text-xs font-bold text-primary-blue">
                        {selectedGlossaryTerm.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Simple Explanation
                    </h4>
                    <p className="text-sm text-slate-700 font-semibold leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      &ldquo;{selectedGlossaryTerm.definition}&rdquo;
                    </p>
                  </div>

                  {selectedGlossaryTerm.example && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Practical Example
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {selectedGlossaryTerm.example}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold">
                  Select a term from the list to view explanation.
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  Learn with Smart Bank AI
                </span>
                <button
                  onClick={() => handleAskAI()}
                  className="px-4 py-2.5 bg-primary-blue text-white font-extrabold text-xs rounded-xl hover:bg-primary-blue/95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="h-4 w-4" />
                  <span>ASK AI TO EXPLAIN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARE OPTIONS MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-border max-w-3xl w-full rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-xl">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-main-text">
                  COMPARE BANKING CONCEPTS
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Generic educational comparison matrix across common banking instruments.
                </p>
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <th className="p-3">Feature</th>
                    <th className="p-3">Savings Account</th>
                    <th className="p-3">Fixed Deposit (FD)</th>
                    <th className="p-3">Recurring Deposit (RD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="p-3 font-black text-slate-900 bg-slate-50">
                      Money Access
                    </td>
                    <td className="p-3">High (Anytime ATM/UPI)</td>
                    <td className="p-3">Lower during locked term</td>
                    <td className="p-3">Locked until maturity</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-slate-900 bg-slate-50">
                      Deposit Style
                    </td>
                    <td className="p-3">Flexible / Any amount</td>
                    <td className="p-3">One-time lump sum</td>
                    <td className="p-3">Regular monthly deposit</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-slate-900 bg-slate-50">
                      Primary Purpose
                    </td>
                    <td className="p-3">Everyday fluid spending</td>
                    <td className="p-3">Fixed-term lump savings</td>
                    <td className="p-3">Disciplined monthly saving</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-slate-900 bg-slate-50">
                      Capital Safety
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">Bank Insured</td>
                    <td className="p-3 text-emerald-600 font-bold">Guaranteed Rate</td>
                    <td className="p-3 text-emerald-600 font-bold">Guaranteed Rate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
              <strong>Note:</strong> Interest rates vary by actual banking institution and economic conditions. This table displays general operational characteristics for learning purposes.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 bg-primary-blue text-white font-extrabold rounded-xl text-xs hover:bg-primary-blue/95 cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDERSTAND EMI MODAL */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-border max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowEmiModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-main-text">
                  UNDERSTANDING EMI (LOAN REPAYMENT)
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Equated Monthly Instalment Basics
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed">
              <p>
                <strong>What is an EMI?</strong> An EMI is a fixed monthly payment you make to a bank or lender until your loan is fully paid off.
              </p>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center font-mono font-black text-slate-900">
                EMI = Principal Amount + Monthly Interest
              </div>
              <p className="text-[11px] text-slate-600">
                • <strong>Principal:</strong> The actual borrowed money.<br />
                • <strong>Interest:</strong> The fee charged by the bank for lending money.<br />
                • <strong>Tenure:</strong> Total months chosen for loan repayment.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setShowEmiModal(false);
                  handleAskAI("Explain EMI calculations in simple terms.");
                }}
                className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
              >
                Ask AI for EMI Formula Examples
              </button>
              <button
                onClick={() => setShowEmiModal(false)}
                className="px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-primary-blue/95 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
