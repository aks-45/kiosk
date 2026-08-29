import { NextResponse } from "next/server";
import { getAIService } from "@/services/ai/factory";
import { FallbackAIService } from "@/services/ai/fallback";

export async function POST(request: Request) {
  let context = "";
  try {
    const body = await request.json();
    context = body.context || "";

    if (!context || typeof context !== "string") {
      return NextResponse.json(
        { success: false, error: "Context string is required for explanation." },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const explanation = await aiService.explainResult(context);

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: any) {
    console.error("Explain API error, using fallback:", error);
    try {
      const fallback = new FallbackAIService();
      const explanation = await fallback.explainResult(context);
      return NextResponse.json({
        success: true,
        explanation,
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: true,
        explanation: "This educational calculation evaluates your parameters against standard banking benchmarks to help you plan effectively.",
      });
    }
  }
}
