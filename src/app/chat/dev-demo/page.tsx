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
    error,
    reset,
    isAnalyzing,
    isRefining,
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
    await refine(answers);
  }

  return (
    <div className="space-y-4">
      {/* File upload and metadata form */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="chart-file">Chart Image</Label>
            <Input
              id="chart-file"
              type="file"
              ref={fileRef}
              accept="image/*"
              disabled={isAnalyzing || isRefining}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="instrument">Instrument (optional)</Label>
              <Input
                id="instrument"
                placeholder="BTC/USDT"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                disabled={isAnalyzing || isRefining}
              />
            </div>
            
            <div>
              <Label htmlFor="timeframe">Timeframe (optional)</Label>
              <Input
                id="timeframe"
                placeholder="4H"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                disabled={isAnalyzing || isRefining}
              />
            </div>
            
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Additional context"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isAnalyzing || isRefining}
              />
            </div>
          </div>
          
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing || isRefining || !fileRef.current?.files?.[0]}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing chart…
              </>
            ) : (
              "Analyze Chart"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status messages */}
      {status === 'analyzing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p>Analyzing chart with AI vision model…</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'needsAnswers' && plan && (
        <ClarifyingForm
          questions={plan.clarifyingQuestions ?? []}
          onSubmit={onSubmitAnswers}
          disabled={isRefining}
          loading={isRefining}
        />
      )}

      {status === 'refining' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p>Refining trade plan with your answers…</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'done' && plan && <TradePlanCard plan={plan} />}

      {status === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <p className="font-semibold">Error:</p>
              <p>{error ?? 'Something went wrong.'}</p>
              <Button onClick={reset} variant="secondary" className="mt-3">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Bottom loading toast */}
    {(isAnalyzing || isRefining) && (
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 rounded-full bg-neutral-900 text-white px-4 h-9 inline-flex items-center gap-2 shadow-md">
        <span className="animate-spin h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent" />
        <span>{isAnalyzing ? "Analyzing chart…" : "Reasoning trade plan…"}</span>
      </div>
    )}
  );
}