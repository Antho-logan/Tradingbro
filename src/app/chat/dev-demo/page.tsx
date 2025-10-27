"use client";

import { useRef, useState } from "react";
import { useTradeAnalysis } from "../hooks/useTradeAnalysis";
import ClarifyingForm from "../components/ClarifyingForm";
import { TradePlanCard } from "../components/TradePlanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Thinking from "@/components/Thinking";
import Reasoning from "@/components/Reasoning";
import ThinkingBar from "@/components/ui/ThinkingBar";

export default function DevDemoTradeChat() {
  const {
    status,               // 'idle' | 'analyzing' | 'needsAnswers' | 'refining' | 'done' | 'error' | 'thinking'
    analyze,
    refine,
    plan,
    questions,
    error,
    reset,
    isRefining,
    isReasoning,
    isLoading,
    getStatusInfo,
    thinkingText,
  } = useTradeAnalysis();

  // Keep local state for file + optional meta (instrument, timeframe, note)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [instrument, setInstrument] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [riskPct, setRiskPct] = useState("1"); // default 1%
  const [forceNextVisionModel, setForceNextVisionModel] = useState(false);

  async function onAnalyze() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    await analyze(file, { instrument, timeframe, risk_pct: riskPct }, forceNextVisionModel);
    setForceNextVisionModel(false); // Reset after use
  }

  async function onReRunAnalysis() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setForceNextVisionModel(true);
    await analyze(file, { instrument, timeframe, risk_pct: riskPct }, true);
  }


  return (
    <>
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe (optional)</Label>
                <Input
                  id="timeframe"
                  placeholder="4H"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="riskPct">Risk %</Label>
                <Input
                  id="riskPct"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  placeholder="Risk % (default 1%)"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onAnalyze}
                disabled={isLoading || !fileRef.current?.files?.[0]}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {status === 'analyzing' ? "Analyzing chart…" : isRefining ? "Refining plan…" : "Processing…"}
                  </>
                ) : (
                  "Analyze Chart"
                )}
              </Button>
              
              {(status === 'error' || status === 'done') && fileRef.current?.files?.[0] && (
                <Button
                  onClick={onReRunAnalysis}
                  disabled={isLoading}
                  variant="secondary"
                  className="px-4"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-pulse">Re-running…</span>
                      <span className="h-3 w-3 rounded-full bg-blue-600/70 animate-bounce ml-2" />
                    </>
                  ) : (
                    "Re-run analysis"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status messages */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              {(() => {
                const statusInfo = getStatusInfo();
                if (!statusInfo) {
                  return (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p>Processing…</p>
                    </div>
                  );
                }
                
                if (statusInfo.type === "reasoning") {
                  return <Reasoning step={statusInfo.step || "Processing"} details={statusInfo.details || "AI is working"} />;
                } else if (statusInfo.type === "thinking") {
                  return <Thinking label={statusInfo.label || "Thinking"} />;
                }
                return null;
              })()}
            </CardContent>
          </Card>
        )}

        {status === 'needsAnswers' || status === 'refining' ? (
          <ClarifyingForm
            questions={questions}
            busy={status === 'refining' || status === 'thinking' || status === 'reasoning' || status === 'analyzing'}
            onSubmit={(answers) => refine(answers)}
          />
        ) : null}

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
                <div className="flex gap-2 mt-3">
                  <Button onClick={reset} variant="secondary">
                    Reset
                  </Button>
                  {fileRef.current?.files?.[0] && (
                    <Button onClick={onReRunAnalysis}>
                      Re-run analysis
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom loading toast */}
      {isLoading && (
        <ThinkingBar
          visible={true}
          label={(() => {
            const statusInfo = getStatusInfo();
            if (statusInfo?.type === "reasoning") {
              return statusInfo?.step || "Analyzing…";
            } else if (statusInfo?.type === "thinking") {
              return statusInfo?.label || "Thinking…";
            }
            return status === 'analyzing' ? "Analyzing chart…" : (isRefining || isReasoning) ? "Reasoning trade plan…" : "Processing…";
          })()}
        />
      )}

      {/* Optional: Show model being used */}
      {(isRefining || isReasoning) && (
        <div className="mt-2 text-xs text-neutral-500">
          {thinkingText ? (
            <Thinking label={thinkingText} />
          ) : (
            <Thinking label={`Reasoning (${process.env.NEXT_PUBLIC_PLANNER_MODEL ?? 'deepseek-reasoner'})`} />
          )}
        </div>
      )}
    </>
  );
}
