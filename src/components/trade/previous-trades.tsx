import { cn } from "@/lib/utils";
import Link from "next/link";

export type TradeItem = {
  symbol: string;
  side: "long" | "short";
  pnlPct: number;
  timeAgo: string;
  tags?: string[];
};

export const MOCK_TRADES: TradeItem[] = [
  { symbol: "BTC/USDT", side: "long",  pnlPct:  2.4, timeAgo: "2h ago", tags:["breakout","partials"] },
  { symbol: "ETH/USDT", side: "short", pnlPct: -0.8, timeAgo: "4h ago", tags:["failed","risk-management"] },
  { symbol: "SOL/USDT", side: "long",  pnlPct:  5.2, timeAgo: "1d ago", tags:["pullback","VWAP"] },
  { symbol: "AAPL", side: "long", pnlPct:  1.2, timeAgo: "3d ago", tags:["earnings"] },
  { symbol: "NVDA", side: "short", pnlPct: -1.5, timeAgo: "5d ago", tags:["resistance"] },
];

function SideBadge({ side }: { side: TradeItem["side"] }) {
  return (
    <span className={cn(
      "px-2 py-0.5 text-xs rounded-md font-medium",
      side === "long" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
    )}>
      {side.toUpperCase()}
    </span>
  );
}

function Pnl({ value }: { value: number }) {
  return (
    <span className={cn(value >= 0 ? "text-emerald-600" : "text-rose-600")}>
      {value >= 0 ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export default function PreviousTrades({ trades = MOCK_TRADES }: { trades?: TradeItem[] }) {
  return (
    <div className="space-y-3">
      {trades.map((t, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="font-mono text-sm text-neutral-800">{t.symbol}</div>
            <SideBadge side={t.side} />
            {t.tags?.length ? (
              <div className="hidden md:flex gap-1">
                {t.tags.slice(0,3).map((tag, j) => (
                  <span key={j} className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-neutral-600 border border-neutral-200">#{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-neutral-500">{t.timeAgo}</div>
            <Pnl value={t.pnlPct} />
            <Link 
              href="/journal" 
              className="text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}