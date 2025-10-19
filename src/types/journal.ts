export type NewJournalEntry = {
  title: string;
  symbol: string;
  side: "long" | "short";
  style: "swing" | "scalp";
  timeframe: string;
  entryPrice?: number;
  notes?: string;
};