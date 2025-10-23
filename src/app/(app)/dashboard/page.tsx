"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedSparkline from "@/components/charts/AnimatedSparkline";
import MetricCard from "@/components/dashboard/MetricCard";
import NavTiles from "@/components/dashboard/NavTiles";
import TerminalWindow from "@/components/terminal/Window";
import AnimatedNumber from "@/components/anim/AnimatedNumber";
import QuickPeek from "@/components/dashboard/QuickPeek";
import { JournalQuickViewDialog } from "@/components/journal/journal-quick-view";

const demoEquity: number[] = [2,3,4,5,6,4,7,8,6,9,12,10,12,14,13,16,18,17,19,21,20,22,25,24,26];

export default function DashboardPage() {
  const [showPeek, setShowPeek] = useState(false);
  const [openJournalQuick, setOpenJournalQuick] = useState(false);
  const router = useRouter();

  return (
    <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your edge at a glance.</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button className="no-ring" onClick={() => router.push("/")}>
            Home
          </Button>
          <Button className="no-ring" onClick={() => setShowPeek(true)}>Quick Peek</Button>
        </div>
      </div>

      {/* KPIs */}
      <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-3">
        <MetricCard
          title="Win Rate"
          note="Last 30 trades"
          value={<AnimatedNumber to={57} suffix="%" format={(n) => n.toFixed(0)} />}
        />
        <MetricCard
          title="Net PnL"
          note="Month to date"
          value={<AnimatedNumber to={2840} prefix="+$" format={(n) => Math.round(n).toLocaleString()} />}
        />
        <MetricCard
          title="Avg R:R"
          note="Rolling 14 trades"
          value={<AnimatedNumber to={2.1} format={(n) => n.toFixed(1)} />}
        />
      </section>

      {/* Performance */}
      <section className="space-y-6">
        <TerminalWindow title="trader@terminal — ~/equity">
          <Card className="rounded-2xl p-5 md:p-6 bg-white shadow-[0_10px_35px_-18px_rgba(0,0,0,0.15)]">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Performance (demo)</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowPeek(true)}>
                  Open Quick Peek
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/reports">Details</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedSparkline data={demoEquity} height={180} ariaLabel="Equity curve" />
              <p className="mt-2 text-sm text-muted-foreground">
                Replace with real data once backend is wired.
              </p>
            </CardContent>
          </Card>
        </TerminalWindow>

        {/* Recent Activity under chart */}
        <Card className="rounded-2xl p-5 md:p-6 bg-white shadow-[0_10px_35px_-18px_rgba(0,0,0,0.15)]">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpenJournalQuick(true)}>
                View Journal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { sym: "BTC/USDT", side: "Long", ago: "2h ago", pnl: +2.4 },
              { sym: "ETH/USDT", side: "Short", ago: "4h ago", pnl: -0.8 },
              { sym: "SOL/USDT", side: "Long", ago: "1d ago", pnl: +5.2 },
            ].map((t) => (
              <div
                key={t.sym + t.ago}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <div>
                  <div className="font-medium">{t.sym}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.side} • {t.ago}
                  </div>
                </div>
                <div className={t.pnl >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                  {t.pnl >= 0 ? "+" : ""}
                  {t.pnl}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Jump straight to the tools you use most.</p>
        <NavTiles />
      </section>

      {/* Overlays */}
      <QuickPeek
        data={demoEquity}
        externalOpen={showPeek}
        onExternalOpenChange={setShowPeek}
        onViewJournal={() => setOpenJournalQuick(true)}
      />
      {/* Centered modal that matches Quick Peek */}
      <JournalQuickViewDialog
        open={openJournalQuick}
        onOpenChange={setOpenJournalQuick}
        items={[
          {
            id: "btc",
            symbol: "BTC/USDT",
            side: "LONG",
            note: "Breakout retest at 42.3k with volume; partials at +2R.",
            pnlPct: 2.4,
            ago: "2h ago",
            tags: ["breakout", "volume", "partials"],
          },
          {
            id: "eth",
            symbol: "ETH/USDT",
            side: "SHORT",
            note: "Failed breakdown above resistance; cut early.",
            pnlPct: -0.8,
            ago: "4h ago",
            tags: ["failed", "risk-management"],
          },
          {
            id: "sol",
            symbol: "SOL/USDT",
            side: "LONG",
            note: "Pullback to 78.50 discount zone + session VWAP.",
            pnlPct: 5.2,
            ago: "1d ago",
            tags: ["pullback", "VWAP", "high-RR"],
          },
        ]}
        onViewAll={() => router.push("/journal")}
      />
    </div>
    </main>
  );
}