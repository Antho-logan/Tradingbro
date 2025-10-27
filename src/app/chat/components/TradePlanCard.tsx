"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TradePlan, Target } from "@/types/trade";

export function TradePlanCard({ plan }: { plan: TradePlan }) {
  const s = plan?.suggested?.[0];
  if (!s) {
    return (
      <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
        <CardContent className="p-5 text-sm text-neutral-600">
          No suggested entries yet. Answer clarifying questions or provide more context.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
      <CardContent className="p-5 space-y-4">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            <span className="font-semibold">{plan.meta?.instrument ?? "Instrument?"}</span>{" "}
            <span className="text-neutral-400">·</span>{" "}
            <span>{plan.meta?.timeframe ?? "TF?"}</span>
          </div>
          <div className="flex gap-2">
            {plan.meta?.trend && <Badge variant="secondary" className="font-mono">{plan.meta.trend}</Badge>}
            {plan.meta?.vwapBias && <Badge variant="outline" className="font-mono">{plan.meta.vwapBias}</Badge>}
          </div>
        </div>

        {/* Title + direction */}
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{s.name}</div>
          <Badge className="font-mono bg-neutral-900 text-white">
            {s.direction.toUpperCase()}
          </Badge>
        </div>

        {/* Entry / Stop / Targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-[12px] font-mono text-neutral-500">Entry</div>
            <div className="text-sm text-neutral-800">{s.entryZone}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-[12px] font-mono text-neutral-500">Invalidation</div>
            <div className="text-sm text-neutral-800">{s.stop}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-[12px] font-mono text-neutral-500">Targets</div>
            <div className="text-sm text-neutral-800">
              {(s.targets ?? []).map((t: Target, i: number) => `T${i + 1}: ${t.rr}R`).join(" · ")}
            </div>
          </div>
        </div>

        {/* Rationale / Invalidations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-[12px] font-mono text-neutral-500">Why</div>
            <ul className="mt-1 list-disc pl-5 text-sm text-neutral-800 space-y-1">
              {(s.rationale ?? []).map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-[12px] font-mono text-neutral-500">Invalidations</div>
            <ul className="mt-1 list-disc pl-5 text-sm text-neutral-800 space-y-1">
              {(s.invalidations ?? []).map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>

        {/* Confidence / warnings */}
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-mono text-neutral-500">
            Confidence {typeof s.confidence === "number" ? `${Math.round(s.confidence * 100)}%` : "—"}
            {typeof s.expectedRR === "number" && <span className="ml-3">Expected R:R {s.expectedRR}</span>}
          </div>
          {plan.warnings?.length ? (
            <div className="text-[12px] text-amber-700">{plan.warnings[0]}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}