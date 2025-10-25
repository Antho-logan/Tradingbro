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
  const {
    status,               // 'idle' | 'analyzing' | 'needsAnswers' | 'refining' | 'done' | 'error'
    analyze,
    refine,
    plan,
    questions,
    error,
    reset,
  } = useTradeAnalysis();

  // Keep local state for file + optional meta (instrument, timeframe, note)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [instrument, setInstrument] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [note, setNote] = useState("");

  async function onAnalyze() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    await analyze(file, { instrument, timeframe, note });
  }

  async function onSubmitAnswers(answers: Record<string, string>) {
    await refine({ answers });
  }

  return (
    <div className="space-y-4">
      {/* Upload + meta */}
      <div className="space-y-4">
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
          <button onClick={onAnalyze} className="h-10 rounded-md bg-neutral-900 px-4 text-white">
            Analyze
          </button>
          <button onClick={reset} className="h-10 rounded-md bg-neutral-100 px-4 text-neutral-900 border border-neutral-200">
            Reset
          </button>
        </div>
      </div>

      {status === 'idle' && (
        <button onClick={onAnalyze} className="h-10 rounded-md bg-neutral-900 px-4 text-white">
          Analyze
        </button>
      )}

      {status === 'analyzing' && <p>Analyzing chart…</p>}

      {status === 'needsAnswers' && plan && (
        <ClarifyingForm
          questions={plan.clarifyingQuestions ?? []}
          onSubmit={onSubmitAnswers}
        />
      )}

      {status === 'refining' && <p>Refining plan…</p>}

      {status === 'done' && plan && <TradePlanCard plan={plan} />}

      {status === 'error' && (
        <div className="text-red-600">
          {error ?? 'Something went wrong.'}
        </div>
      )}
    </div>
  );
}