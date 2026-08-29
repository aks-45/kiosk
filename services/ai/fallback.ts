import { AIService, FraudAnalysisResult } from "./provider";

// Non-financial topic keywords for domain guardrails
const NON_FINANCIAL_PATTERNS = [
  "physics", "quantum", "gravity", "chemistry", "biology", "photosynthesis",
  "algebra homework", "calculus formula", "geometry theorem", "shakespeare",
  "movie review", "cricket score", "football match", "weather forecast",
  "python code for game", "javascript game"
];

// Financial Knowledge Engine dictionary (RAG semantic index)
const FINANCIAL_KNOWLEDGE_BASE: { keywords: string[]; title: string; answer: string }[] = [
  {
    keywords: ["reverse repo", "repo rate", "policy rate", "monetary policy"],
    title: "Repo & Reverse Repo Rate",
    answer: "**Repo Rate** is the interest rate at which the central bank (RBI) lends short-term funds to commercial banks. **Reverse Repo Rate** is the rate at which commercial banks deposit excess liquidity with the central bank to earn safe returns. These rates are key monetary tools used to regulate inflation and money supply."
  },
  {
    keywords: ["compound interest", "compounding", "rule of 72"],
    title: "Compound Interest",
    answer: "**Compound interest** is 'interest calculated on interest'. The interest you earn in each cycle is added back to your principal amount, accelerating the growth of your balance over time. According to the **Rule of 72**, dividing 72 by your annual interest rate gives the approximate number of years needed to double your money."
  },
  {
    keywords: ["inflation", "purchasing power", "cpi"],
    title: "Inflation",
    answer: "**Inflation** is the progressive increase in the average price of goods and services over time, which reduces the purchasing power of your money. To preserve and grow your wealth, your investment portfolio should aim for a post-tax return that exceeds the annual inflation rate."
  },
  {
    keywords: ["fixed deposit", "fd", "term deposit"],
    title: "Fixed Deposits (FD)",
    answer: "A **Fixed Deposit (FD)** is a safe investment vehicle where you lock in a lump sum with a bank for a predetermined tenure (from 7 days up to 10 years) at a guaranteed interest rate. FDs offer capital protection and predictable returns, with senior citizens typically receiving a bonus 0.50% interest rate."
  },
  {
    keywords: ["recurring deposit", "rd", "monthly deposit"],
    title: "Recurring Deposits (RD)",
    answer: "A **Recurring Deposit (RD)** allows you to deposit a fixed amount every month for a set period. It is ideal for salaried individuals looking to build a lump sum through systematic monthly savings while earning fixed-deposit interest rates."
  },
  {
    keywords: ["mutual fund", "sip", "systematic investment"],
    title: "Mutual Funds & SIP",
    answer: "A **Mutual Fund** pools money from multiple investors to invest in a diversified portfolio of stocks, bonds, or money market instruments managed by professional fund managers. A **Systematic Investment Plan (SIP)** allows you to invest small, fixed amounts regularly (e.g. ₹500/month), benefiting from rupee-cost averaging."
  },
  {
    keywords: ["saving", "investing", "difference between save and invest"],
    title: "Saving vs. Investing",
    answer: "**Saving** focuses on capital preservation and liquidity for short-term needs and emergencies (low risk, modest returns like savings accounts or FDs). **Investing** involves deploying funds into assets like equities, mutual funds, or real estate for long-term capital appreciation and inflation-beating growth, accompanied by market risk."
  },
  {
    keywords: ["cibil", "credit score", "experian", "crif"],
    title: "Credit Score & CIBIL",
    answer: "A **Credit Score** (such as CIBIL) ranges from 300 to 900 and reflects your creditworthiness based on your loan repayment and credit card history. A score of **750+** is generally considered excellent, helping you secure faster loan approvals, higher credit limits, and lower interest rates."
  },
  {
    keywords: ["emi", "equated monthly installment", "amortization"],
    title: "Equated Monthly Installment (EMI)",
    answer: "An **EMI** is a fixed payment made by a borrower to a lender on a specified date every month. Each EMI consists of both a principal repayment portion and an accrued interest portion. In the early stages of a loan, a higher percentage goes towards interest, shifting towards principal over time."
  },
  {
    keywords: ["ifsc", "micr", "neft", "rtgs", "imps", "upi"],
    title: "Digital Payment Codes & Systems",
    answer: "- **IFSC** (11 characters) identifies specific bank branches for electronic transfers.\n- **NEFT**: Batched electronic fund transfers.\n- **RTGS**: Real-time gross settlement for high-value transactions (₹2 Lakhs+).\n- **IMPS / UPI**: Instant 24/7 peer-to-peer and merchant payments via smartphone."
  },
  {
    keywords: ["50/30/20", "budget rule", "budgeting technique"],
    title: "50/30/20 Budgeting Principle",
    answer: "The **50/30/20 rule** is a foundational personal finance guideline:\n- **50% for Needs:** Essential living expenses (housing, utilities, groceries, healthcare).\n- **30% for Wants:** Discretionary lifestyle spending (dining out, entertainment, shopping).\n- **20% for Savings & Investments:** Emergency fund contributions, loan prepayments, and retirement SIPs."
  },
  {
    keywords: ["emergency fund", "contingency fund", "buffer"],
    title: "Emergency Fund",
    answer: "An **Emergency Fund** is a financial safety net containing 3 to 6 months' worth of essential living expenses. It should be kept in highly liquid, low-risk instruments (such as a high-yield savings account or sweep-in FD) so it can be accessed immediately during unexpected life events."
  },
  {
    keywords: ["scam", "fraud", "phishing", "cyber", "digital safety", "fake sms"],
    title: "Digital Banking Safety & Scam Defense",
    answer: "To safeguard your bank accounts:\n1. **Never share OTPs, PINs, or UPI passcodes** with anyone — bank officials will never ask for them.\n2. **Avoid clicking unverified SMS/WhatsApp links** warning of account blockage or KYC expiration.\n3. **Use biometric & 2-Factor Authentication (2FA)** across all digital banking portals."
  },
  {
    keywords: ["liquidity", "liquid assets"],
    title: "Liquidity in Finance",
    answer: "**Liquidity** measures the speed and ease with which an asset can be converted into cash without significant loss of value. Cash and savings accounts are the most liquid, while real estate and long-term locked bonds have lower liquidity."
  },
  {
    keywords: ["tax", "80c", "income tax", "old regime", "new regime", "tax saving"],
    title: "Tax Planning Basics",
    answer: "- **Old Tax Regime:** Allows deductions under Section 80C (up to ₹1.5 Lakhs in PPF, ELSS, EPF), health insurance (80D), and home loan interest.\n- **New Tax Regime:** Offers lower tax slab rates with a higher basic rebate exemption but fewer itemized deductions. Choose based on your total eligible investment deductions."
  }
];

export class FallbackAIService implements AIService {
  async getChatResponse(
    history: { role: "user" | "model"; content: string }[],
    message: string
  ): Promise<string> {
    const query = (message || "").toLowerCase().trim();

    // 1. Removed off-topic non-financial queries block

    // 2. Semantic lookup in Comprehensive Financial Knowledge Base
    for (const item of FINANCIAL_KNOWLEDGE_BASE) {
      for (const kw of item.keywords) {
        if (query.includes(kw)) {
          return item.answer;
        }
      }
    }

    // Removed the "Contextual smart assistance" block that blocked general queries

    return "I am Smart Bank AI, your capable AI assistant. Since I am currently operating in offline fallback mode, my general knowledge is limited. Please try asking me about compound interest, banking, or budgeting!";
  }

  async getFinancialInsight(
    income: number,
    expenses: number,
    savings: number,
    investments: number,
    score: number
  ): Promise<string> {
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

    let insight = `Your Financial Health Score is ${score}/100. `;
    if (score >= 80) {
      insight += "Excellent financial discipline! Your surplus and savings cushion are very strong. ";
    } else if (score >= 60) {
      insight += "Good baseline! You maintain a steady surplus, though building additional investment allocation could boost long-term wealth. ";
    } else {
      insight += "Attention needed. High expense ratios or low monthly surplus may leave you vulnerable to emergencies. ";
    }

    insight += `Your monthly surplus is ₹${surplus.toLocaleString("en-IN")}. `;
    if (savingsRate < 10) {
      insight += "Your savings rate is below 10%. We recommend building a 3-month emergency fund in an accessible savings account. ";
    } else {
      insight += `Your savings rate is healthy at ${savingsRate.toFixed(1)}%. `;
    }

    if (expenseRatio > 70) {
      insight += "Your living expenses exceed 70% of income. Aim to keep fixed overhead under 50-60%. ";
    }

    if (investments === 0) {
      insight += "Consider starting a small monthly Recurring Deposit (RD) or mutual fund SIP once your emergency cushion is established.";
    } else {
      insight += `You are investing ₹${investments.toLocaleString("en-IN")} monthly to beat inflation over time.`;
    }

    return insight;
  }

  async analyzeFraudMessage(text: string): Promise<FraudAnalysisResult> {
    const normalized = text.toLowerCase();
    const urgentKeywords = ["block", "suspend", "kyc", "restrict", "immediately", "today", "urgent", "freeze", "expire", "closed"];
    const sensitiveKeywords = ["otp", "pin", "password", "cvv", "credential", "card number", "pan card", "aadhaar"];
    const linkKeywords = ["http", "https", "bit.ly", "click", "link", "url", "www", ".apk", ".xyz", ".top"];
    const giftKeywords = ["win", "reward", "lottery", "cashback", "lucky draw", "gift card", "claim", "credited"];

    const detectedUrgency = urgentKeywords.filter((k) => normalized.includes(k));
    const detectedSensitive = sensitiveKeywords.filter((k) => normalized.includes(k));
    const detectedLink = linkKeywords.filter((k) => normalized.includes(k));
    const detectedGift = giftKeywords.filter((k) => normalized.includes(k));

    const warningSigns: string[] = [];
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let confidence = 0.7;
    let explanation = "No high-risk scam markers detected. Always verify unexpected notifications with your official banking app.";
    let recommendation = "Verify the sender's identity. If it claims to be from a bank, contact customer care through verified official channels.";

    if (detectedUrgency.length > 0) warningSigns.push("Urgent or threatening language (" + detectedUrgency.join(", ") + ")");
    if (detectedSensitive.length > 0) warningSigns.push("Requests for sensitive credentials (" + detectedSensitive.join(", ") + ")");
    if (detectedLink.length > 0) warningSigns.push("Contains unverified links (" + detectedLink.join(", ") + ")");
    if (detectedGift.length > 0) warningSigns.push("Promises of lottery/cashback (" + detectedGift.join(", ") + ")");

    const totalMarkers = warningSigns.length;
    if (totalMarkers >= 3 || (detectedLink.length > 0 && (detectedUrgency.length > 0 || detectedSensitive.length > 0))) {
      riskLevel = "HIGH";
      confidence = 0.95;
      explanation = "High risk of Phishing scam. Legitimate banks will never threaten instant account suspension or demand credentials over SMS.";
      recommendation = "Never click links or share OTPs/PINs. Delete this message and report it immediately.";
    } else if (totalMarkers >= 1) {
      riskLevel = "MEDIUM";
      confidence = 0.8;
      explanation = "Suspicious patterns detected. The message uses urgency or unverified links to prompt quick action.";
      recommendation = "Do not click links or share credentials. Log in directly via your official banking app to check.";
    }

    return { riskLevel, confidence, warningSigns, explanation, recommendation };
  }

  async getBudgetInsight(
    income: number,
    categories: { name: string; amount: number }[],
    totalPlanned: number,
    remaining: number
  ): Promise<string> {
    const savingsCat = categories.find(c => c.name.toLowerCase().includes("saving") || c.name.toLowerCase().includes("emergency"));
    const savingsAmount = savingsCat?.amount || 0;
    const savingsRate = income > 0 ? (savingsAmount / income) * 100 : 0;

    let insight = `Your planned budget allocates ₹${totalPlanned.toLocaleString("en-IN")} out of ₹${income.toLocaleString("en-IN")}. `;
    if (remaining > 0) {
      insight += `You have an unallocated surplus buffer of ₹${remaining.toLocaleString("en-IN")}. Consider adding it to your savings or investment fund. `;
    } else if (remaining < 0) {
      insight += `Warning: Planned spending exceeds income by ₹${Math.abs(remaining).toLocaleString("en-IN")}. Review discretionary categories. `;
    } else {
      insight += "Your budget is 100% balanced with zero deficit. ";
    }

    if (savingsRate < 10) {
      insight += "Try to allocate at least 10-20% towards savings each month.";
    } else {
      insight += `Your savings allocation of ${savingsRate.toFixed(0)}% is a healthy financial habit!`;
    }

    return insight;
  }

  async getGoalInsight(
    goalName: string,
    targetAmount: number,
    currentSavings: number,
    months: number,
    monthlyRequired: number,
    progressPercent: number
  ): Promise<string> {
    let insight = `To achieve "${goalName}" (₹${targetAmount.toLocaleString("en-IN")}) in ${months} months, save ₹${monthlyRequired.toLocaleString("en-IN")} per month. `;
    if (progressPercent >= 50) {
      insight += `You are already ${progressPercent}% towards your target! `;
    } else if (progressPercent > 0) {
      insight += `You have completed ${progressPercent}% so far — consistency will get you there. `;
    }

    if (monthlyRequired > 15000) {
      insight += "This is an ambitious monthly contribution; consider extending your timeline if budget gets tight.";
    } else {
      insight += "This goal timeline is balanced and achievable with steady monthly contributions.";
    }

    return insight;
  }

  async explainResult(context: string): Promise<string> {
    return `Here is a clear explanation of your calculation:\n\n${context}\n\nSmart Bank evaluates your cash flow and parameters deterministically to give you clear, actionable guidance.`;
  }
}
