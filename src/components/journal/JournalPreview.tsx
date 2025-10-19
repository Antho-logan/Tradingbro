"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, ArrowDownRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type JournalPreviewItem = {
  id: string;
  symbol: string;
  dir: "LONG" | "SHORT";
  pnlPct: number;
  time: string; // e.g. "2h ago"
  note: string;
};

const demo: JournalPreviewItem[] = [
  {
    id: "j1",
    symbol: "BTC/USDT",
    dir: "LONG",
    pnlPct: 2.4,
    time: "2h ago",
    note: "Breakout retest at 42.3k with volume. Took partials into prior high.",
  },
  {
    id: "j2",
    symbol: "ETH/USDT",
    dir: "SHORT",
    pnlPct: -0.8,
    time: "4h ago",
    note: "Failed breakdown above resistance, invalidated quickly—good cut.",
  },
  {
    id: "j3",
    symbol: "SOL/USDT",
    dir: "LONG",
    pnlPct: 5.2,
    time: "1d ago",
    note: "Pullback to discount + session VWAP. Clear BOS on LTF.",
  },
];

export default function JournalPreview({
  items = demo,
  onViewAll,
  className,
}: {
  items?: JournalPreviewItem[];
  onViewAll?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("card", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Recent Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li
              key={it.id}
              className={cn(
                "rounded-xl border border-border bg-card px-3 py-2 shadow-sm",
                "hover:shadow-md transition",
                "animate-rise"
              )}
              style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{it.symbol}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "px-1.5 py-0 text-[10px]",
                        it.dir === "LONG"
                          ? "border-emerald-600/20 bg-emerald-50 text-emerald-700"
                          : "border-rose-600/20 bg-rose-50 text-rose-700"
                      )}
                    >
                      {it.dir}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {it.time}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{it.note}</p>
                </div>
                <PnL pct={it.pnlPct} />
              </div>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewAll?.()}
          >
            View Journal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PnL({ pct }: { pct: number }) {
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium",
        up ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
      )}
      aria-label={`PnL ${up ? "profit" : "loss"} ${pct.toFixed(1)} percent`}
    >
      <Icon className="h-4 w-4" />
      {up ? "+" : ""}
      {pct.toFixed(1)}%
    </div>
  );
}