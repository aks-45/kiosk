import { AIService, FraudAnalysisResult } from "./provider";

export class OpenAIService implements AIService {
  private apiKey: string;
  private model = "gpt-4o-mini";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callOpenAI(
    systemInstruction: string,
    prompt: string,
    forceJson = false,
    historyMessages: { role: "user" | "assistant"; content: string }[] = []
  ): Promise<string> {
    const url = "https://api.openai.com/v1/chat/completions";
    
    const messages = [
      { role: "system", content: systemInstruction },
      ...historyMessages,
      { role: "user", content: prompt }
    ];

    const body: any = {
      model: this.model,
      messages,
      temperature: 0.7,
    };

    if (forceJson) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) {
      throw new Error("Empty response from OpenAI Generative AI");
    }

    return replyText.trim();
  }

  async getFinancialInsight(
    income: number,
    expenses: number,
    savings: number,
    investments: number,
    score: number
  ): Promise<string> {
    const system = "You are Smart Bank's Financial Health Advisor. Write 2-3 sentences of educational financial literacy advice. Emphasize that this is simulation data. Use friendly language. Do not provide personalized, regulated investment advice.";
    const prompt = `Assess this financial status:\nIncome: ₹${income}\nExpenses: ₹${expenses}\nSavings: ₹${savings}\nInvestments: ₹${investments}\nOverall Score: ${score}/100\nProvide actionable improvement advice.`;

    try {
      return await this.callOpenAI(system, prompt, false);
    } catch (e) {
      console.error("OpenAI financial health call failed, falling back:", e);
      throw e;
    }
  }

  async analyzeFraudMessage(text: string): Promise<FraudAnalysisResult> {
    const system = `You are a bank security expert. Analyze the suspect text message/email/link and return a structured JSON response only.
The JSON object must strictly match this structure:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number (between 0.0 and 1.0),
  "warningSigns": string[],
  "explanation": "string (1-2 sentences maximum)",
  "recommendation": "string (1 sentence maximum)"
}`;
    
    const prompt = `Suspect Text to analyze: "${text}"`;

    try {
      const responseText = await this.callOpenAI(system, prompt, true);
      return JSON.parse(responseText) as FraudAnalysisResult;
    } catch (e) {
      console.error("OpenAI fraud analyzer call failed:", e);
      throw e;
    }
  }

  async getChatResponse(
    history: { role: "user" | "model"; content: string }[],
    message: string
  ): Promise<string> {
    const system = "You are Smart Bank AI, a capable, friendly and knowledgeable general-purpose AI assistant. You are not restricted to banking or finance. Answer the user's actual question directly and naturally, regardless of topic, as long as the request is allowed. Detect the language of each user message and respond in the same language whenever possible.";
    
    const historyMessages = history.map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("assistant" as const),
      content: h.content
    }));

    try {
      return await this.callOpenAI(system, message, false, historyMessages);
    } catch (e) {
      console.error("OpenAI Chat call failed:", e);
      throw e;
    }
  }

  async getBudgetInsight(
    income: number,
    categories: { name: string; amount: number }[],
    totalPlanned: number,
    remaining: number
  ): Promise<string> {
    const system = "You are Smart Bank's budget advisor. Give 2-3 sentences of educational budget advice based on the allocation. Keep it practical and simple.";
    const catBreakdown = categories.map(c => `- ${c.name}: ₹${c.amount.toLocaleString("en-IN")}`).join("\n");
    const prompt = `Monthly Income: ₹${income.toLocaleString("en-IN")}\n${catBreakdown}\nTotal Planned: ₹${totalPlanned.toLocaleString("en-IN")}\nRemaining: ₹${remaining.toLocaleString("en-IN")}\n\nGive brief educational advice.`;
    return await this.callOpenAI(system, prompt, false);
  }

  async getGoalInsight(
    goalName: string,
    targetAmount: number,
    currentSavings: number,
    months: number,
    monthlyRequired: number,
    progressPercent: number
  ): Promise<string> {
    const system = "You are Smart Bank's goal planning advisor. Give 2-3 sentences of encouraging, educational advice about reaching this savings goal.";
    const prompt = `Goal: ${goalName}\nTarget: ₹${targetAmount.toLocaleString("en-IN")}\nCurrent: ₹${currentSavings.toLocaleString("en-IN")}\nRemaining: ₹${(targetAmount - currentSavings).toLocaleString("en-IN")}\nTimeline: ${months} months\nMonthly Required: ₹${monthlyRequired.toLocaleString("en-IN")}\nProgress: ${progressPercent}%`;
    return await this.callOpenAI(system, prompt, false);
  }

  async explainResult(context: string): Promise<string> {
    const system = "The user clicked 'Explain My Result' on a calculation output. Explain what the numbers mean in simple, educational language. 3-4 sentences max.";
    return await this.callOpenAI(system, context, false);
  }
}
