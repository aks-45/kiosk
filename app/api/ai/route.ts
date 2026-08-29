import { NextResponse } from "next/server";
import { getAIService } from "@/services/ai/factory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages are required." },
        { status: 400 }
      );
    }

    // Separate history from the latest user message
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      content: m.content,
    }));

    const latestMessage = messages[messages.length - 1].content || "";

    const aiService = getAIService();
    const reply = await aiService.getChatResponse(history, latestMessage);

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error("AI API error:", error.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "AI service is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}
