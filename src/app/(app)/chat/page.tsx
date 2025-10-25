"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTradeAnalysis } from "@/app/chat/hooks/useTradeAnalysis";
import { ClarifyingForm } from "@/app/chat/components/ClarifyingForm";
import { TradePlanCard } from "@/app/chat/components/TradePlanCard";
import TerminalWindow from "@/components/terminal/Window";
import UploadDropzone from "@/components/chat/UploadDropzone";
import { Card } from "@/components/ui/card";
import PreviousTrades from "@/components/trade/previous-trades";

export default function TradeChatPage() {
  const { status, analyze, refine, plan, error, reset, questions, isAnalyzing, isRefining } = useTradeAnalysis();

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [instrument, setInstrument] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [note, setNote] = useState("");

  async function onAnalyze() {
    if (!file) {
      alert("Upload a chart image first.");
      return;
    }
    await analyze(file, { instrument, timeframe, note });
  }

  function handleImageSelected(url: string) {
    setImageUrl(url);
    // Convert URL back to File for the hook
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "chart.png", { type: "image/png" });
        setFile(file);
      });
  }

  async function onSubmitAnswers(answers: Record<string, string>) {
    await refine(answers);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
      {/* HEADER: Back + Title */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
        <h1 className="text-xl font-bold">AI Trade Chat</h1>
      </div>

      {/* GRID: chat left (wider), uploader right (narrower) */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* LEFT: Analysis results */}
        <section className="flex flex-col">
          <Card className="flex min-h-[620px] flex-1 rounded-2xl p-5 md:p-6 bg-white shadow-[0_10px_35px_-18px_rgba(0,0,0,0.15)]">
            <div className="space-y-4">
              {/* Upload controls */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Chart screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] ?? null;
                      setFile(selectedFile);
                      if (selectedFile) {
                        const url = URL.createObjectURL(selectedFile);
                        setImageUrl(url);
                      }
                    }}
                    className="mt-2"
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    className="h-10 rounded border px-3"
                    placeholder="Instrument (e.g., BTC/USDT)"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                  />
                  <input
                    className="h-10 rounded border px-3"
                    placeholder="Timeframe (e.g., 4H / 15m)"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  />
                  <input
                    className="h-10 rounded border px-3"
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Analyze button */}
              {status === "idle" && (
                <button onClick={onAnalyze} className="h-10 px-4 rounded bg-neutral-900 text-white">
                  Analyze
                </button>
              )}

              {/* Status messages */}
              {status === "analyzing" && <div>Analyzing chart…</div>}
              {status === "refining" && <div>Refining plan…</div>}

              {/* Clarifying form */}
              {status === "needsAnswers" && questions && questions.length > 0 && (
                <ClarifyingForm questions={questions} onSubmit={onSubmitAnswers} />
              )}

              {/* Trade plan result */}
              {status === "done" && plan && <TradePlanCard plan={plan} />}

              {/* Error state */}
              {status === "error" && (
                <div className="text-red-600">
                  {error ?? "Something went wrong."}
                  <button className="ml-3 underline" onClick={reset}>
                    Reset
                  </button>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* RIGHT: Terminal-shaped container WITHOUT header/traffic lights */}
        <section className="space-y-3">
          <div className="text-xs text-muted-foreground font-mono">
            trade-terminal — analysis
          </div>
          <TerminalWindow hideHeader>
            <UploadDropzone
              imageUrl={imageUrl}
              analyzing={status === "analyzing"}
              onSelectImage={handleImageSelected}
            />
          </TerminalWindow>
          
          {/* Previous Trades Section */}
          <div className="mt-6">
            <TerminalWindow hideHeader>
              <div className="space-y-3">
                <h3 className="font-mono text-sm text-neutral-700">Previous trades</h3>
                <PreviousTrades />
              </div>
            </TerminalWindow>
          </div>
        </section>
      </div>
    </main>
  );
}