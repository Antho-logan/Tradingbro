"use client";

import { useRef, useState } from "react";
import { useTradeAnalysis } from "../hooks/useTradeAnalysis";
import { ClarifyingForm } from "../components/ClarifyingForm";
import { TradePlanCard } from "../components/TradePlanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function DevDemoTradeChat() {
  const { status, plan, questions, error, debug, analyze, refine, reset } = useTradeAnalysis();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [instrument, setInstrument] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [note, setNote] = useState("");

  const onAnalyze = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    await analyze(file, { instrument, timeframe, note });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 space-y-6">
      <div className="text-xl font-semibold font-mono">AI Trade Chat — Dev Demo</div>

      {/* Upload + meta */}
      <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="min-w-0">
              <Input type="file" accept="image/*" ref={fileRef} className="h-10" />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <Label className="text-[12px] font-mono text-neutral-500">Instrument</Label>
              <Input className="h-10" placeholder="BTC/USDT" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <Label className="text-[12px] font-mono text-neutral-500">Timeframe</Label>
              <Input className="h-10" placeholder="15m / 1H / 4H" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <Label className="text-[12px] font-mono text-neutral-500">Note</Label>
              <Input className="h-10" placeholder="Context…" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="primary" onClick={onAnalyze} disabled={status === "analyzing" || status === "refining"}>
              {status === "analyzing" ? "Analyzing…" : "Analyze"}
            </Button>
            <Button variant="secondary" onClick={reset} disabled={status === "analyzing" || status === "refining"}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="rounded-2xl border border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            <div className="font-semibold mb-2">Error</div>
            <div>{error}</div>
            {debug && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-mono">Debug info</summary>
                <pre className="mt-2 text-xs overflow-auto bg-red-100 p-2 rounded">
                  {JSON.stringify(debug, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clarifying questions */}
      {status === "needsAnswers" && questions?.length ? (
        <ClarifyingForm questions={questions} onSubmit={refine} disabled={status !== "needsAnswers"} />
      ) : null}

      {/* Suggested plan */}
      {status === "done" && plan ? (
        <TradePlanCard plan={plan} />
      ) : null}

      {/* UI Guard: Empty suggestions/questions */}
      {status === "done" && (!plan?.suggested || plan.suggested.length === 0) ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-700">
            <div className="font-semibold mb-2">Couldn't analyze chart</div>
            <div>I couldn't read enough from the chart to generate a trade plan. Try re-running with a clearer image or crop tighter to the price action.</div>
          </CardContent>
        </Card>
      ) : null}

      {/* Raw JSON toggle for debugging */}
      {plan && (
        <details className="rounded-xl border border-neutral-200 p-4">
          <summary className="cursor-pointer text-sm font-mono text-neutral-600">Raw JSON</summary>
          <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(plan, null, 2)}</pre>
        </details>
      )}

      {/* Debug info toggle */}
      {debug && (
        <details className="rounded-xl border border-neutral-200 p-4">
          <summary className="cursor-pointer text-sm font-mono text-neutral-600">Debug Info</summary>
          <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(debug, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}