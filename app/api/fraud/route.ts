import { NextResponse } from "next/server";
import { getAIService } from "@/services/ai/factory";
import { FallbackAIService } from "@/services/ai/fallback";

export async function POST(request: Request) {
  let text = "";
  try {
    const body = await request.json();
    text = body.text || "";

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Text content is required for analysis." },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const result = await aiService.analyzeFraudMessage(text);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Fraud API error, using fallback:", error);
    try {
      const fallback = new FallbackAIService();
      const result = await fallback.analyzeFraudMessage(text);
      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: true,
        riskLevel: "MEDIUM",
        confidence: 0.8,
        warningSigns: ["Unverified external message"],
        explanation: "Always verify suspicious banking communications with your branch before acting.",
        recommendation: "Do not click links or share credentials.",
      });
    }
  }
}
