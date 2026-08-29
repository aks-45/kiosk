import { AIService } from "./provider";
import { GeminiAIService } from "./gemini";
import { OpenAIService } from "./openai";

export function getAIService(): AIService {
  const provider = process.env.AI_PROVIDER || "gemini";
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === "openai" && openaiKey) {
    return new OpenAIService(openaiKey);
  }

  if (geminiKey && geminiKey.trim() !== "") {
    return new GeminiAIService(geminiKey.trim());
  }

  throw new Error("GEMINI_API_KEY is missing. Please add your GEMINI_API_KEY in your environment settings.");
}
