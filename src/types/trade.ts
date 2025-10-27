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

export type PartialPlan = {
  meta?: {
    instrument?: string | undefined;
    timeframe?: string | undefined;
    trend?: string | undefined;
    session?: string | undefined;
    vwapBias?: string | undefined;
  };
  clarifyingQuestions?: ClarifyingQuestion[];
  suggested: SuggestedPlan[];
  warnings?: string[];
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