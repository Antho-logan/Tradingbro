"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { AnimatedLineChart } from "@/components/charts/animated-line-chart";
import { AnimatedBarChart } from "@/components/charts/animated-bar-chart";
import { DonutWinsLosses } from "@/components/charts/donut-wins-losses";
import { genDemo } from "@/lib/chart";
import { PageEnter } from "@/components/motion/page-enter";

type RangeKey = "7d" | "30d" | "90d";
const ranges: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default function ReportsPage() {
  const [range, setRange] = React.useState<RangeKey>("30d");
  const len = ranges[range];

  // demo series (deterministic)
  const equity = React.useMemo(() => genDemo(42 + len, len, 0.25, 1.1), [len]);
  const pnlDay = React.useMemo(() => {
    const x = genDemo(7 + len, len, 0, 2.1).map((v, i, a) => (i === 0 ? 0 : v - a[i - 1]));
    const min = Math.min(...x), max = Math.max(...x) || 1;
    return x.map(v => ((v - min) / (max - min)) * 2 - 1);
  }, [len]);
  const wins = Math.round(len * 0.56);
  const losses = len - wins;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <PageEnter>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-mono">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-mono">
                  {range.toUpperCase()} <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["7d", "30d", "90d"] as RangeKey[]).map(k => (
                  <DropdownMenuItem key={k} onClick={() => setRange(k)}>
                    {k.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="font-mono"
              onClick={() => toast.success("Export started (demo)")}
            >
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </PageEnter>

      <PageEnter staggerMs={90} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Win Rate" value={`${Math.round((wins / len) * 100)}%`} hint={`${len} trades`} />
        <MetricCard title="Net PnL" value={`${((wins - losses) * 0.8).toFixed(1)}%`} hint="Cumulative period" />
        <MetricCard title="Avg R:R" value="2.3" hint="Across trades" />
      </PageEnter>

      <PageEnter staggerMs={110} className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground">Wins vs Losses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DonutWinsLosses wins={wins} losses={losses} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground">P&amp;L by Day (fluctuation)</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <AnimatedBarChart data={pnlDay} height={240} posColor="#06b6d4" negColor="#8b5cf6" />
            <p className="mt-2 text-xs text-muted-foreground">Cyan = positive, Violet = negative (demo). Switch range to see re-animation.</p>
          </CardContent>
        </Card>
      </PageEnter>

      <PageEnter>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground">Equity Curve (demo)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <AnimatedLineChart
              data={equity}
              height={260}
              stroke="#10b981"
              gradientFrom="rgba(16,185,129,0.18)"
              gradientTo="rgba(16,185,129,0.00)"
              showAxes
            />
          </CardContent>
        </Card>
      </PageEnter>
    </main>
  );
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      </CardContent>
    </Card>
  );
}