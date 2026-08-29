import { AIService, FraudAnalysisResult } from "./provider";

const SYSTEM_INSTRUCTION = `You are Kiosk AI, a capable, friendly and knowledgeable general-purpose AI assistant.

KIOSK is the application you are part of. It does NOT restrict the subjects you can discuss.

Answer the user's actual question directly and naturally, regardless of topic.

You can discuss general knowledge, science, technology, programming, education, mathematics, history, geography, business, commerce, finance, banking, creative topics, casual conversation and normal everyday topics.

Do not redirect unrelated questions toward banking or finance.

Do not claim that you can only answer financial questions.

Maintain relevant conversation context across turns. If the user asks a follow-up question, use previous messages to understand what they mean. If the user changes topic, follow the new topic naturally.

Detect the language of the current user message and respond in the same language whenever possible.
If the user writes in English, respond in English.
If the user writes in Hindi, respond in Hindi.
If the user writes in Hinglish, respond naturally in Hinglish.
The user can change language during the same conversation. Follow the current message language.

Adapt response length to the user's request. Be concise for simple questions, detailed when asked for depth.

Do not unnecessarily repeat previous answers. If the user says "explain differently", give a genuinely different explanation.

Do not repeatedly mention KIOSK or that you are an AI assistant.

For banking or financial questions, provide educational information. Do not pretend to access real bank accounts or perform real transactions. Never request passwords, PINs, OTPs, card numbers or real banking credentials.

Be helpful, accurate, conversational and natural.`;

export class GeminiAIService implements AIService {
  private apiKey: string;
  private models: string[];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.models = [
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
    ];
  }

  /**
   * Call Gemini generateContent API with model fallback.
   * Accepts either a single prompt string or a full multi-turn contents array.
   */
  private async callGemini(
    systemInstruction: string,
    contents: { role: string; parts: { text: string }[] }[],
    options: { forceJson?: boolean; maxTokens?: number } = {}
  ): Promise<string> {
    const { forceJson = false, maxTokens = 2048 } = options;
    let lastError: Error | null = null;

    for (const model of this.models) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        const body: Record<string, unknown> = {
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
            ...(forceJson ? { responseMimeType: "application/json" } : {}),
          },
        };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Gemini API error [${model}]: ${response.status} - ${errorBody}`);
          lastError = new Error(`Gemini API ${response.status}: ${errorBody}`);
          continue;
        }

        const data = await response.json();
        // Gemini 2.5 thinking models return thinking in earlier parts
        // The actual response is the last text part
        const parts = data.candidates?.[0]?.content?.parts || [];
        const textParts = parts.filter((p: any) => p.text && !p.thought);
        const replyText = textParts.length > 0
          ? textParts[textParts.length - 1].text
          : parts[parts.length - 1]?.text;
        if (replyText && replyText.trim() !== "") {
          return replyText.trim();
        }

        lastError = new Error(`Empty response from Gemini model ${model}`);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error(`Gemini call failed [${model}]:`, err.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini models failed.");
  }

  /**
   * Main chat response - uses proper multi-turn conversation with full history.
   */
  async getChatResponse(
    history: { role: "user" | "model"; content: string }[],
    message: string
  ): Promise<string> {
    // Build proper multi-turn contents array
    const rawContents = history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    // Add the current user message
    rawContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Gemini API requires the first turn to be 'user'
    while (rawContents.length > 0 && rawContents[0].role !== "user") {
      rawContents.shift();
    }

    const contents = rawContents.length > 0 ? rawContents : [{ role: "user", parts: [{ text: message }] }];

    // Call Gemini with the general-purpose system instruction
    return await this.callGemini(SYSTEM_INSTRUCTION, contents, {
      maxTokens: 2048,
    });
  }

  async getFinancialInsight(
    income: number,
    expenses: number,
    savings: number,
    investments: number,
    score: number
  ): Promise<string> {
    const system =
      "Explain this Financial Health Score in 2-3 clean, readable sentences with practical advice. Do not use LaTeX symbols or equations.";
    const prompt = `Income: ₹${income}, Expenses: ₹${expenses}, Savings: ₹${savings}, Investments: ₹${investments}, Score: ${score}/100. Surplus: ₹${income - expenses}.`;

    return await this.callGemini(
      system,
      [{ role: "user", parts: [{ text: prompt }] }],
      { maxTokens: 300 }
    );
  }

  async analyzeFraudMessage(text: string): Promise<FraudAnalysisResult> {
    const system = `Analyze this message for digital banking scams. Return clean JSON only:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number,
  "warningSigns": string[],
  "explanation": "string",
  "recommendation": "string"
}`;

    const responseText = await this.callGemini(
      system,
      [{ role: "user", parts: [{ text: `Analyze: "${text}"` }] }],
      { forceJson: true, maxTokens: 300 }
    );

    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as FraudAnalysisResult;
  }

  async getBudgetInsight(
    income: number,
    categories: { name: string; amount: number }[],
    totalPlanned: number,
    remaining: number
  ): Promise<string> {
    const system =
      "Summarize this monthly budget allocation in 2 clean, encouraging sentences. Avoid math symbols.";
    const catBreakdown = categories
      .filter((c) => c.amount > 0)
      .map((c) => `${c.name}: ₹${c.amount}`)
      .join(", ");
    const prompt = `Income: ₹${income}, Planned: ₹${totalPlanned}, Buffer: ₹${remaining}. Allocations: ${catBreakdown}`;

    return await this.callGemini(
      system,
      [{ role: "user", parts: [{ text: prompt }] }],
      { maxTokens: 300 }
    );
  }

  async getGoalInsight(
    goalName: string,
    targetAmount: number,
    currentSavings: number,
    months: number,
    monthlyRequired: number,
    progressPercent: number
  ): Promise<string> {
    const system =
      "Provide 2 clean, practical sentences about reaching this savings goal. Avoid equations.";
    const prompt = `Goal: ${goalName}, Target: ₹${targetAmount}, Current: ₹${currentSavings}, Timeline: ${months} months, Monthly Required: ₹${monthlyRequired}, Progress: ${progressPercent}%.`;

    return await this.callGemini(
      system,
      [{ role: "user", parts: [{ text: prompt }] }],
      { maxTokens: 300 }
    );
  }

  async explainResult(context: string): Promise<string> {
    const system =
      "Explain this result in 2-3 clean, educational sentences for a banking customer. Avoid LaTeX and formulas.";

    return await this.callGemini(
      system,
      [{ role: "user", parts: [{ text: context }] }],
      { maxTokens: 300 }
    );
  }
}
