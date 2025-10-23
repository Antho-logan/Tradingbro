export type ClarifyingQuestion = {
  id: string;
  text: string;
  options?: string[];
};

export type Target = { rr: number };

export type SuggestedPlan = {
  name: string;
  direction: "long" | "short";
  entryZone: string;
  stop: string;
  targets: Target[];
  rationale: string[];
  invalidations: string[];
  expectedRR?: number;
  confidence?: number;
};

export type TradePlan = {
  meta?: {
    instrument?: string;
    timeframe?: string;
    trend?: string;
    session?: string;
    vwapBias?: string;
  };
  clarifyingQuestions?: ClarifyingQuestion[];
  suggested: SuggestedPlan[];
  warnings?: string[];
};