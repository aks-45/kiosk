import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const principal = parseFloat(body.principal);
    const annualInterestRate = parseFloat(body.interestRate);
    const durationYears = parseFloat(body.durationYears);

    // Validation checks
    if (
      isNaN(principal) ||
      principal <= 0 ||
      isNaN(annualInterestRate) ||
      annualInterestRate < 0 ||
      isNaN(durationYears) ||
      durationYears <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Inputs must be positive numbers." },
        { status: 400 }
      );
    }

    // Boundary limits (to protect against overflow crashes)
    if (principal > 1000000000) {
      return NextResponse.json(
        { success: false, error: "Principal amount cannot exceed ₹100 Crores (₹1,000,000,000)." },
        { status: 400 }
      );
    }
    if (annualInterestRate > 100) {
      return NextResponse.json(
        { success: false, error: "Interest rate cannot exceed 100%." },
        { status: 400 }
      );
    }
    if (durationYears > 50) {
      return NextResponse.json(
        { success: false, error: "Duration cannot exceed 50 years." },
        { status: 400 }
      );
    }

    const n = durationYears * 12; // Total months
    let monthlyEMI = 0;

    if (annualInterestRate === 0) {
      // Simple division for 0% interest
      monthlyEMI = principal / n;
    } else {
      const r = annualInterestRate / 12 / 100; // Monthly interest decimal rate
      monthlyEMI =
        (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalRepayment = monthlyEMI * n;
    const totalInterest = totalRepayment - principal;

    return NextResponse.json({
      success: true,
      monthlyEMI: Math.round(monthlyEMI),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(totalRepayment),
    });
  } catch (error: any) {
    console.error("Loan EMI calculation error:", error);
    return NextResponse.json(
      { success: false, error: "EMI calculation failed." },
      { status: 500 }
    );
  }
}
