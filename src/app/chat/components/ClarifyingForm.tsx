"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Q = { id: string; text: string; options?: string[] };

export function ClarifyingForm({
  questions,
  onSubmit,
  disabled,
  loading = false
}: {
  questions: Q[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // normal case: send each q.id -> value
    let answers: Record<string, string> = {};
    for (const q of questions) {
      answers[q.id] = String(localAnswers[q.id] ?? "").trim();
    }

    // special case: fallback "repair" question -> parse into required keys
    if (questions.length === 1 && questions[0].id === "repair") {
      const txt = (localAnswers["repair"] || "").toLowerCase();
      // very forgiving parsing
      const risk = /(\d+(?:\.\d+)?)\s*%?/.exec(txt)?.[1] ?? "";
      const tf   = /(1d|d|3d|2d|12h|4h|1h|30m|15m|5m|1m)\b/.exec(txt)?.[1] ?? "";
      const inst = /(btc|eth|sol|link|[a-z]{2,6}\/?[a-z]{2,6})\b/.exec(txt)?.[0] ?? "";

      answers = {
        risk_pct: risk,                     // e.g. "1"
        timeframe: tf.toUpperCase(),        // e.g. "15M" or "1D"
        instrument: inst.replace("/", "").toUpperCase() // "LINKUSDT"
      };
    }

    await onSubmit(answers); // <- calls useTradeAnalysis.refine(answers)
  };

  return (
    <Card className="rounded-2xl border border-neutral-200/60 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-mono text-neutral-500">Clarifying questions</div>
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="grid grid-cols-1 gap-2">
              <Label className="text-[12px] font-mono text-neutral-600">{q.text}</Label>
              {q.options && q.options.length ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = localAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLocalAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={[
                          "h-9 rounded-lg px-3 text-sm border",
                          selected
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Input
                  className="h-10"
                  placeholder="Type answer…"
                  value={localAnswers[q.id] ?? ""}
                  onChange={(e) => setLocalAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            className="h-10 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            onClick={handleSubmit}
            disabled={disabled || loading}
          >
            {loading && <span className="animate-spin h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent" />}
            {loading ? "Submitting…" : "Submit answers"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}