import { AIService } from "./provider";
import { GeminiAIService } from "./gemini";
import { OpenAIService } from "./openai";

export function getAIService(): AIService {
  const provider = process.env.AI_PROVIDER || "gemini";
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === "gemini" && geminiKey) {
    return new GeminiAIService(geminiKey);
  }

  if (provider === "openai" && openaiKey) {
    return new OpenAIService(openaiKey);
  }

  // No valid AI provider configured — throw so the API route can report the error
  throw new Error(
    "No AI service configured. Set a valid GEMINI_API_KEY or OPENAI_API_KEY in your .env file."
  );
}
