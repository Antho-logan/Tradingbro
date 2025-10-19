"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import AnimatedSparkline from "@/components/charts/AnimatedSparkline";

function pct(a: number, b: number) {
  if (a === 0) return 0;
  return ((b - a) / Math.abs(a)) * 100;
}

export default function QuickPeek({
  data,
  openOnFirstVisit = true,
  externalOpen,
  onExternalOpenChange,
  onViewJournal,
}: {
  data: number[];
  openOnFirstVisit?: boolean;
  externalOpen?: boolean;
  onExternalOpenChange?: (v: boolean) => void;
  onViewJournal?: () => void;
}) {
  const seenKey = "tb.peek.seen";
  const autoOpen =
    externalOpen ??
    (openOnFirstVisit &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem(seenKey));
  if (
    openOnFirstVisit &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem(seenKey)
  ) {
    sessionStorage.setItem(seenKey, "1");
  }

  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const stats = useMemo(
    () => ({
      change: pct(first, last),
      rr: 2.1,
      win: 57,
      min: Math.min(...data),
      max: Math.max(...data),
    }),
    [first, last, data]
  );

  return (
    <Dialog open={autoOpen} onOpenChange={(v) => onExternalOpenChange?.(v)}>
      {/* NOTE: content uses bg-card / border so it looks correct in LIGHT mode */}
      <DialogContent className="sm:max-w-2xl bg-card border border-border">
        <DialogHeader>
          <DialogTitle>Quick Peek</DialogTitle>
          <DialogDescription>
            Fast snapshot of performance (demo data).
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Win Rate" value={`${stats.win}%`} note="Last 30 trades" />
          <MetricCard title="Avg R:R" value={stats.rr.toFixed(1)} note="Rolling 14 trades" />
          <MetricCard
            title="Equity Change"
            value={`${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(1)}%`}
            note={`Range ${stats.min.toFixed(0)} → ${stats.max.toFixed(0)}`}
          />
        </section>

        <Card className="card">
          <CardContent className="p-4">
            <AnimatedSparkline data={data} height={100} ariaLabel="Equity mini-chart" />
            <p className="mt-2 text-sm text-muted-foreground">
              Placeholder sparkline. Replace later with real equity/PnL series.
            </p>
          </CardContent>
        </Card>

        <ul className="text-sm text-muted-foreground list-disc pl-5">
          <li>HTF bias aligned on most winners (demo).</li>
          <li>Risk kept ≤ 1% on loss streaks (demo).</li>
          <li>Next: fewer impulse entries during NY open (demo).</li>
        </ul>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onExternalOpenChange?.(false)}>
            Close
          </Button>
          <Button onClick={() => onViewJournal?.()}>
            View Journal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}