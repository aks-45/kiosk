import { NextResponse } from "next/server";
import { getAIService } from "@/services/ai/factory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const income = parseFloat(body.income);
    const expenses = parseFloat(body.expenses);
    const savings = parseFloat(body.savings);
    const investments = parseFloat(body.investments);

    // Validation
    if (
      isNaN(income) || income < 0 ||
      isNaN(expenses) || expenses < 0 ||
      isNaN(savings) || savings < 0 ||
      isNaN(investments) || investments < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Inputs must be positive numbers." },
        { status: 400 }
      );
    }

    const surplus = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
    const investmentRate = income > 0 ? (investments / income) * 100 : 0;

    // Deterministic Financial Health Score Logic (out of 100)
    let score = 50; // Neutral baseline

    // Factor 1: Budget Surplus / Deficit
    if (surplus > 0) {
      score += 15;
    } else {
      score -= 20; // Deficits hurt score significantly
    }

    // Factor 2: Savings Cushion Rate (Target is >= 20% of net income)
    if (savingsRate >= 20) {
      score += 15;
    } else if (savingsRate >= 10) {
      score += 10;
    } else if (savingsRate > 0) {
      score += 5;
    }

    // Factor 3: Expense Ratio (Target is <= 50% for needs, <= 70% total)
    if (expenseRatio <= 50) {
      score += 10;
    } else if (expenseRatio <= 70) {
      score += 5;
    } else {
      score -= 10;
    }

    // Factor 4: Long term investment habit (stocks, mutual funds, gold)
    if (investmentRate >= 8) {
      score += 10;
    } else if (investments > 0) {
      score += 5;
    }

    // Bind bounds between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Obtain AI assessment comments (handles API availability fallbacks)
    const aiService = getAIService();
    const aiInsight = await aiService.getFinancialInsight(
      income,
      expenses,
      savings,
      investments,
      score
    );

    return NextResponse.json({
      success: true,
      score,
      surplus,
      savingsRate: Math.round(savingsRate * 10) / 10,
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      aiInsight,
    });
  } catch (error: any) {
    console.error("Financial Health API error:", error);
    return NextResponse.json(
      { success: false, error: "Health audit compilation failed." },
      { status: 500 }
    );
  }
}
