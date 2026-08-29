import { AIService } from "./provider";
import { GeminiAIService } from "./gemini";
import { OpenAIService } from "./openai";

const DEFAULT_GEMINI_KEY = "AIzaSyDj1qT4KuVVFnYknhUCnNVLVLkCQYKmgdg";

export function getAIService(): AIService {
  const provider = process.env.AI_PROVIDER || "gemini";
  const geminiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === "openai" && openaiKey) {
    return new OpenAIService(openaiKey);
  }

  // Default to Gemini with robust key fallback
  return new GeminiAIService(geminiKey);
}
