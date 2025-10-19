"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  TrendingUp,
  X,
  BarChart3,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export type JournalEntry = {
  id: string;
  symbol: string;
  dir: "LONG" | "SHORT";
  pnlPct: number;
  pnlUsd?: number;
  time: string;
  date: string;
  note: string;
  tags?: string[];
};

const demoEntries: JournalEntry[] = [
  {
    id: "j1",
    symbol: "BTC/USDT",
    dir: "LONG",
    pnlPct: 2.4,
    pnlUsd: 2840,
    time: "2h ago",
    date: "2025-01-14",
    note: "Breakout retest at 42.3k with strong volume confirmation. Took partial profits at prior high of 43.1k. Holding remaining position for continuation higher.",
    tags: ["breakout", "volume", "partials"]
  },
  {
    id: "j2",
    symbol: "ETH/USDT",
    dir: "SHORT",
    pnlPct: -0.8,
    pnlUsd: -320,
    time: "4h ago",
    date: "2025-01-14",
    note: "Failed breakdown above resistance at 2,650. Setup invalidated quickly after false breakout. Good stop execution, minimal damage.",
    tags: ["failed", "risk-management"]
  },
  {
    id: "j3",
    symbol: "SOL/USDT",
    dir: "LONG",
    pnlPct: 5.2,
    pnlUsd: 1560,
    time: "1d ago",
    date: "2025-01-13",
    note: "Pullback to 78.50 discount zone + session VWAP. Clear BOS on LTF confirmation. Risk:reward 1:3.5 made this a high-probability setup.",
    tags: ["pullback", "VWAP", "high-RR"]
  },
  {
    id: "j4",
    symbol: "AVAX/USDT",
    dir: "LONG",
    pnlPct: 3.1,
    pnlUsd: 890,
    time: "2d ago",
    date: "2025-01-12",
    note: "Ascending triangle breakout on good volume. Entry on retest of breakout level. Market structure supports further upside.",
    tags: ["triangle", "breakout", "structure"]
  },
  {
    id: "j5",
    symbol: "MATIC/USDT",
    dir: "SHORT",
    pnlPct: -1.2,
    pnlUsd: -450,
    time: "3d ago",
    date: "2025-01-11",
    note: "Resistance rejection at 0.92. Overextended RSI on hourly timeframe. Plan worked initially but market reversed on news.",
    tags: ["resistance", "reversal"]
  }
];

export default function JournalPeekSheet({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const stats = {
    totalPnl: demoEntries.reduce((sum, e) => sum + (e.pnlUsd || 0), 0),
    winRate: (demoEntries.filter(e => e.pnlPct > 0).length / demoEntries.length) * 100,
    avgWin: demoEntries.filter(e => e.pnlPct > 0).reduce((sum, e) => sum + e.pnlPct, 0) / demoEntries.filter(e => e.pnlPct > 0).length,
    avgLoss: Math.abs(demoEntries.filter(e => e.pnlPct < 0).reduce((sum, e) => sum + e.pnlPct, 0) / demoEntries.filter(e => e.pnlPct < 0).length),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Trading Journal</SheetTitle>
              <SheetDescription>
                Recent trades and performance insights
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className={cn(
                "text-2xl font-bold",
                stats.totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                ${stats.totalPnl >= 0 ? "+" : ""}{stats.totalPnl.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Total P&L</div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {stats.winRate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                +{stats.avgWin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Win</div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">
                -{stats.avgLoss.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Loss</div>
            </CardContent>
          </Card>
        </div>

        {/* Journal Entries */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {demoEntries.map((entry, i) => (
              <Card key={entry.id} className="card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-semibold text-base">{entry.symbol}</div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "px-2 py-1 text-xs",
                          entry.dir === "LONG"
                            ? "border-emerald-600/20 bg-emerald-50 text-emerald-700"
                            : "border-rose-600/20 bg-rose-50 text-rose-700"
                        )}
                      >
                        {entry.dir}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {entry.time}
                      </span>
                      <PnLIndicator pct={entry.pnlPct} />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {entry.note}
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{entry.date}</span>
                    {entry.pnlUsd && (
                      <span className={cn(
                        "font-medium",
                        entry.pnlUsd >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        ${entry.pnlUsd >= 0 ? "+" : ""}{entry.pnlUsd.toFixed(0)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1 h-10 font-mono" asChild>
            <Link href="/journal" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Full Journal
            </Link>
          </Button>
          <Button className="flex-1 h-10 font-mono" asChild>
            <Link href="/reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PnLIndicator({ pct }: { pct: number }) {
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
        up ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
      )}
    >
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}{pct.toFixed(1)}%
    </div>
  );
}