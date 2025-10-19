"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JournalEntry = {
  id: string;
  symbol: string;
  side: "Long" | "Short";
  win: boolean;
  rr: number;
  pnlPct: number; // e.g. +2.4 or -0.8
  timestamp: string; // already formatted
  tags: string[];
  note: string;
};

export function EntryCard({ e }: { e: JournalEntry }) {
  return (
    <Card className="rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
      <CardContent className="p-5 sm:p-6 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm px-2 py-0.5 rounded-md border border-neutral-200">
                {e.symbol}
              </span>
              <span
                className={cn(
                  "font-mono text-xs px-2 py-0.5 rounded-md border",
                  e.side === "Long"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                )}
              >
                {e.side}
              </span>
              <span
                className={cn(
                  "font-mono text-xs px-2 py-0.5 rounded-md border",
                  e.win
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                )}
              >
                {e.win ? "Win" : "Loss"}
              </span>
            </div>

            <div className="mt-3 font-mono text-[13px] text-neutral-600">
              {e.timestamp}
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-800">
              {e.note}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] px-2 py-0.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <Button size="sm" className="no-ring">View Details</Button>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-mono text-[13px] text-neutral-600">R:R</div>
            <div className="font-mono text-base">{e.rr.toFixed(1)}</div>
            <div className="font-mono text-[13px] text-neutral-600 mt-2">PnL</div>
            <div
              className={cn(
                "font-mono text-base",
                e.pnlPct >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {e.pnlPct >= 0 ? "+" : ""}
              {e.pnlPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}