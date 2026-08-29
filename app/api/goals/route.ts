import { NextResponse } from "next/server";
import { getAIService } from "@/services/ai/factory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goalName = body.goalName || "Savings Goal";
    const targetAmount = parseFloat(body.targetAmount);
    const currentSavings = parseFloat(body.currentSavings) || 0;
    const months = parseInt(body.months);

    if (isNaN(targetAmount) || targetAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Target amount must be a positive number." },
        { status: 400 }
      );
    }

    if (isNaN(months) || months <= 0) {
      return NextResponse.json(
        { success: false, error: "Target timeline (months) must be greater than 0." },
        { status: 400 }
      );
    }

    const remainingAmount = Math.max(0, targetAmount - currentSavings);
    const requiredMonthlySaving = Math.round(remainingAmount / months);
    const progressPercent = Math.min(100, Math.round((currentSavings / targetAmount) * 100));

    const aiService = getAIService();
    const aiInsight = await aiService.getGoalInsight(
      goalName,
      targetAmount,
      currentSavings,
      months,
      requiredMonthlySaving,
      progressPercent
    );

    return NextResponse.json({
      success: true,
      goalName,
      targetAmount,
      currentSavings,
      remainingAmount,
      months,
      requiredMonthlySaving,
      progressPercent,
      aiInsight,
    });
  } catch (error: any) {
    console.error("Financial Goals API error:", error);
    return NextResponse.json(
      { success: false, error: "Goal calculation failed." },
      { status: 500 }
    );
  }
}
