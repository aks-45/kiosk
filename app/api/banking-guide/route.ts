import { NextResponse } from "next/server";

export interface GuideOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  accessLevel: "High" | "Medium" | "Low / Fixed";
  depositType: string;
  suitableFor: string;
}

export interface BankingGuideResponse {
  success: boolean;
  category: string;
  summary: string;
  whyExplanation: string;
  options: GuideOption[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, answers } = body;

    let responseData: BankingGuideResponse = {
      success: true,
      category: category || "save",
      summary: "Options you may want to learn about based on your situation.",
      whyExplanation: "These banking concepts match your indicated timeline, accessibility preferences, and financial learning goals.",
      options: [],
    };

    if (category === "save") {
      const { timeHorizon, accessNeed } = answers || {};
      
      if (accessNeed === "yes" || timeHorizon === "soon") {
        responseData.summary = "For short-term needs with frequent access, liquid savings accounts provide maximum flexibility.";
        responseData.whyExplanation = "Because you indicated that you may need access to your funds soon or on a regular basis, liquid accounts maintain instant access while keeping your capital safe.";
        responseData.options = [
          {
            id: "savings-account",
            title: "Savings Account",
            subtitle: "Everyday Accessible Savings",
            description: "Usually designed for keeping money accessible while earning modest interest.",
            features: [
              "Instant access via ATM, UPI, & net banking",
              "Earns quarterly interest on daily balance",
              "Ideal for emergency funds and routine expenses",
            ],
            accessLevel: "High",
            depositType: "Flexible / Any time",
            suitableFor: "Everyday liquid saving & short-term buffers",
          },
          {
            id: "recurring-deposit",
            title: "Recurring Deposit (RD)",
            subtitle: "Disciplined Monthly Savings",
            description: "Allows regular monthly deposits over a chosen period with fixed interest returns.",
            features: [
              "Fixed monthly deposit amount",
              "Guaranteed interest rate for selected tenure",
              "Encourages disciplined saving habits",
            ],
            accessLevel: "Medium",
            depositType: "Regular monthly instalments",
            suitableFor: "Saving for planned future expenses step-by-step",
          },
          {
            id: "fixed-deposit",
            title: "Fixed Deposit (FD)",
            subtitle: "Lump Sum Term Deposit",
            description: "Generally allows money to be kept for a fixed period at a stated interest rate.",
            features: [
              "Higher interest rate than regular savings",
              "Lock-in period with fixed maturity date",
              "Option for monthly or quarterly interest payouts",
            ],
            accessLevel: "Low / Fixed",
            depositType: "One-time lump sum",
            suitableFor: "Growing surplus funds over a locked duration",
          },
        ];
      } else {
        responseData.summary = "For medium to long-term goals without immediate access needs, fixed-term options offer higher returns.";
        responseData.whyExplanation = "Since you don't require immediate day-to-day access, committing money for fixed terms locks in interest rates and prevents impulse spending.";
        responseData.options = [
          {
            id: "fixed-deposit",
            title: "Fixed Deposit (FD)",
            subtitle: "Lump Sum Term Deposit",
            description: "Generally allows money to be kept for a fixed period at a stated interest rate.",
            features: [
              "Higher interest returns than basic savings",
              "Fixed tenure from 7 days to 10 years",
              "Guaranteed capital protection",
            ],
            accessLevel: "Low / Fixed",
            depositType: "One-time lump sum",
            suitableFor: "Long-term savings goals & capital safety",
          },
          {
            id: "recurring-deposit",
            title: "Recurring Deposit (RD)",
            subtitle: "Regular Monthly Savings",
            description: "Allows regular deposits over a chosen period at predictable interest rates.",
            features: [
              "Automated monthly savings from your account",
              "Fixed tenure & clear return timeline",
              "No large initial lump sum required",
            ],
            accessLevel: "Medium",
            depositType: "Regular monthly deposits",
            suitableFor: "Building a substantial fund incrementally",
          },
          {
            id: "savings-account",
            title: "Savings Account",
            subtitle: "Liquid Reserve Account",
            description: "Usually designed for keeping money accessible while earning some interest.",
            features: [
              "Keeps a portion of your money liquid",
              "Zero penalty for withdrawal",
              "Seamless digital transfers whenever needed",
            ],
            accessLevel: "High",
            depositType: "Flexible",
            suitableFor: "Holding an immediate emergency cushion",
          },
        ];
      }
    } else if (category === "send") {
      responseData.summary = "Key digital fund transfer mechanisms in modern banking.";
      responseData.whyExplanation = "Different transfer modes are optimized for speed, transaction limits, and settlement protocols.";
      responseData.options = [
        {
          id: "upi",
          title: "Unified Payments Interface (UPI)",
          subtitle: "Instant Mobile Payments",
          description: "Designed for quick digital payments and transfers using smartphone apps and Virtual Payment Addresses (VPA).",
          features: [
            "Instant 24/7 money transfers",
            "No need to share bank account number",
            "Ideal for small to medium daily transactions",
          ],
          accessLevel: "High",
          depositType: "Real-time Instant",
          suitableFor: "Person-to-person payments & merchant billing",
        },
        {
          id: "neft",
          title: "National Electronic Funds Transfer (NEFT)",
          subtitle: "Batch Electronic Bank Transfer",
          description: "Electronic fund transfer system commonly used for bank-to-bank transfers across India.",
          features: [
            "Settled in half-hourly batches 24/7",
            "No minimum limit required",
            "Suitable for routine bill payments and salary transfers",
          ],
          accessLevel: "High",
          depositType: "Batch Settlement",
          suitableFor: "Routine payments and moderate transfer amounts",
        },
        {
          id: "rtgs",
          title: "Real Time Gross Settlement (RTGS)",
          subtitle: "High-Value Transfer System",
          description: "Designed for real-time gross settlement of eligible high-value transactions.",
          features: [
            "Continuous real-time settlement",
            "Designed primarily for high-value transactions (₹2 Lakh+)",
            "Direct beneficiary account credit",
          ],
          accessLevel: "High",
          depositType: "Real-time Gross",
          suitableFor: "Large commercial and institutional transfers",
        },
        {
          id: "imps",
          title: "Immediate Payment Service (IMPS)",
          subtitle: "24/7 Immediate Interbank Transfer",
          description: "An electronic fund transfer service designed for immediate 24x7 transfers.",
          features: [
            "Instant account-to-account credit",
            "Available 365 days a year including holidays",
            "Requires MMID or Account Number + IFSC",
          ],
          accessLevel: "High",
          depositType: "Real-time Instant",
          suitableFor: "Urgent individual interbank transfers",
        },
      ];
    } else if (category === "borrow") {
      responseData.summary = "Educational overview of common credit options and loan concepts.";
      responseData.whyExplanation = "Understanding loan types and repayment mechanisms helps borrowers evaluate interest costs responsibly.";
      responseData.options = [
        {
          id: "personal-loan",
          title: "Personal Loan",
          subtitle: "Unsecured Multi-purpose Credit",
          description: "An unsecured loan generally used for personal financial needs.",
          features: [
            "No collateral security required",
            "Fixed monthly EMI payments over set tenure",
            "Flexible usage for medical, emergency or personal expenses",
          ],
          accessLevel: "Medium",
          depositType: "Lump sum disbursement",
          suitableFor: "Short-to-medium term personal cash requirements",
        },
        {
          id: "education-loan",
          title: "Education Loan",
          subtitle: "Student & Higher Education Financing",
          description: "A loan intended to help finance eligible education expenses like tuition, books, and living expenses.",
          features: [
            "Moratorium period (repayment starts after course completion)",
            "Covers tuition fees, hostel, and study material",
            "Tax benefits under Section 80E (in India)",
          ],
          accessLevel: "Medium",
          depositType: "Institutional disbursement",
          suitableFor: "Financing college and higher degree studies",
        },
        {
          id: "home-loan",
          title: "Home Loan",
          subtitle: "Long-term Housing Finance",
          description: "A loan generally used to finance the purchase or construction of a home.",
          features: [
            "Long tenure (up to 20–30 years)",
            "Secured loan backed by property collateral",
            "Relatively lower interest rates compared to personal loans",
          ],
          accessLevel: "Low / Fixed",
          depositType: "Property disbursement",
          suitableFor: "Buying, building, or renovating residential property",
        },
      ];
    } else if (category === "invest") {
      responseData.summary = "Basic educational principles of growing wealth and understanding investment risk.",
      responseData.whyExplanation = "Different investment instruments balance returns, liquidity, and capital risk in different ways.",
      responseData.options = [
        {
          id: "low-risk",
          title: "Low-Risk Savings & Fixed Deposits",
          subtitle: "Capital Preservation Focus",
          description: "Options designed to keep your principal safe while earning steady, predictable interest.",
          features: [
            "Guaranteed capital safety by bank/government backing",
            "Predictable returns unaffected by stock market fluctuations",
            "Ideal foundation for short-term savings and emergency funds",
          ],
          accessLevel: "Medium",
          depositType: "Fixed or Savings",
          suitableFor: "Preserving capital with zero market risk",
        },
        {
          id: "mutual-funds",
          title: "Mutual Funds Basics",
          subtitle: "Pooled Professional Investment",
          description: "Vehicles that pool money from multiple investors to invest in stocks, bonds, or short-term debt.",
          features: [
            "Managed by professional fund managers",
            "SIP (Systematic Investment Plan) allows small monthly investments",
            "Offers diversification across multiple companies",
          ],
          accessLevel: "High",
          depositType: "SIP or Lumpsum",
          suitableFor: "Building long-term wealth over time",
        },
        {
          id: "fixed-income",
          title: "Fixed-Income Instruments",
          subtitle: "Bonds & Government Securities",
          description: "Debt instruments that pay a fixed rate of interest over a pre-determined schedule.",
          features: [
            "Regular interest income payouts",
            "Lower risk profile than equity/stocks",
            "Helps balance volatile stock portfolios",
          ],
          accessLevel: "Medium",
          depositType: "Term Bond",
          suitableFor: "Stable income generation & capital stability",
        },
      ];
    } else if (category === "account") {
      responseData.summary = "Understanding bank account categories and their intended purposes.";
      responseData.whyExplanation = "Bank accounts are tailored for specific user groups, transaction volumes, and financial objectives.";
      responseData.options = [
        {
          id: "savings-account",
          title: "Savings Account",
          subtitle: "Personal Money Management",
          description: "Generally intended for individuals to save and manage personal money.",
          features: [
            "Earns interest on maintained balances",
            "Debit card, mobile app & net banking access",
            "Daily withdrawal and transfer limits designed for individuals",
          ],
          accessLevel: "High",
          depositType: "Individual deposit",
          suitableFor: "Personal salary, savings, and routine bill payments",
        },
        {
          id: "current-account",
          title: "Current Account",
          subtitle: "Business & High-Volume Account",
          description: "Generally designed for frequent business transactions without daily transaction counts limits.",
          features: [
            "Unlimited deposits and withdrawal transactions",
            "Overdraft facility available for working capital",
            "No interest earned on balance in standard current accounts",
          ],
          accessLevel: "High",
          depositType: "Business cash flow",
          suitableFor: "Traders, businesses, companies & entrepreneurs",
        },
        {
          id: "salary-account",
          title: "Salary Account",
          subtitle: "Employer Payroll Account",
          description: "A specialized savings account opened through an employer to receive monthly salary credits.",
          features: [
            "Zero minimum balance requirement",
            "Free chequebook, debit card & digital transactions",
            "Complimentary personal insurance covers in many banks",
          ],
          accessLevel: "High",
          depositType: "Monthly payroll credit",
          suitableFor: "Salaried employees receiving monthly income",
        },
        {
          id: "student-account",
          title: "Student Account",
          subtitle: "Youth Financial Literacy Account",
          description: "Designed for students with low or zero balance requirements to build financial habits early.",
          features: [
            "Low or zero minimum balance rules",
            "Discounted debit cards and educational benefits",
            "Built-in spending alerts for budget awareness",
          ],
          accessLevel: "High",
          depositType: "Student allowance",
          suitableFor: "Teenagers and college students managing allowances",
        },
      ];
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Banking Guide API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate guide results." },
      { status: 500 }
    );
  }
}
