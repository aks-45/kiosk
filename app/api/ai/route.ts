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
    const rawMsg = error.message || String(error);
    console.error("AI API error:", rawMsg);

    let clientMsg = "AI service is temporarily unavailable. Please try again.";

    if (rawMsg.includes("GEMINI_API_KEY is missing") || rawMsg.includes("No AI service configured")) {
      clientMsg = "GEMINI_API_KEY is missing. Please add your GEMINI_API_KEY in your Render Dashboard -> Environment tab.";
    } else if (rawMsg.includes("leaked") || rawMsg.includes("PERMISSION_DENIED") || rawMsg.includes("API_KEY_INVALID") || rawMsg.includes("403")) {
      clientMsg = "The current Gemini API key is blocked/invalid. Please generate a new key at aistudio.google.com and set GEMINI_API_KEY in Render Environment settings.";
    } else if (rawMsg.includes("Quota") || rawMsg.includes("429")) {
      clientMsg = "Gemini API rate limit reached. Please wait a minute and try again.";
    }

    return NextResponse.json(
      {
        success: false,
        error: clientMsg,
      },
      { status: 500 }
    );
  }
}
