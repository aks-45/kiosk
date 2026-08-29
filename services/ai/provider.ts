export interface FraudAnalysisResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  warningSigns: string[];
  explanation: string;
  recommendation: string;
}

export interface AIService {
  getFinancialInsight(
    income: number,
    expenses: number,
    savings: number,
    investments: number,
    score: number
  ): Promise<string>;

  analyzeFraudMessage(text: string): Promise<FraudAnalysisResult>;

  getChatResponse(
    history: { role: "user" | "model"; content: string }[],
    message: string
  ): Promise<string>;

  getBudgetInsight?(
    income: number,
    categories: { name: string; amount: number }[],
    totalPlanned: number,
    remaining: number
  ): Promise<string>;

  getGuideInsight?(
    category: string,
    userChoices: Record<string, string>
  ): Promise<string>;

  getGoalInsight(
    goalName: string,
    targetAmount: number,
    currentSavings: number,
    months: number,
    monthlyRequired: number,
    progressPercent: number
  ): Promise<string>;

  explainResult(context: string): Promise<string>;
}
