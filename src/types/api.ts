import type { TradePlan, ClarifyingQuestion } from "./trade";

export type TradeChatResponse =
  | { status: "questions"; questions: ClarifyingQuestion[]; debug?: any }
  | { status: "plan"; plan: TradePlan; suggestions: any[]; debug?: any }
  | { status: "error"; error: string; debug?: any };