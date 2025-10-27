import type { TradePlan, ClarifyingQuestion, SuggestedPlan } from "./trade";

export type PlannerSuccess = {
  traceId: string;
  meta: Record<string, unknown>;
  questions: ClarifyingQuestion[];
  suggestions: SuggestedPlan[]
};

export type PlannerError = {
  traceId: string;
  error: { message: string; code?: string }
};

export type PlannerResponse = PlannerSuccess | PlannerError;

// Legacy type for backward compatibility (deprecated)
export type TradeChatResponse =
  | { status: "questions"; questions: ClarifyingQuestion[]; plan?: TradePlan; debug?: Record<string, unknown>; traceId?: string }
  | { status: "plan"; plan: TradePlan; debug?: Record<string, unknown>; traceId?: string }
  | { status: "error"; error: string; debug?: Record<string, unknown>; traceId?: string };
