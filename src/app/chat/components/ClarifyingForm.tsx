"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Q = { id: string; text: string; options?: string[] };

export default function ClarifyingForm({
  questions,
  onSubmit,
  busy = false,                  // <-- NEW: parent-driven busy flag (optional)
  onCancel,                      // <-- optional escape hatch
}: {
  questions: Q[];
  onSubmit: (answers: Record<string, string>) => Promise<void> | void;
  busy?: boolean;
  onCancel?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // --- NEW: reset answers when the questions change
  const qSig = useMemo(() => JSON.stringify(questions?.map((q) => q.id) ?? []), [questions]);
  useEffect(() => {
    setAnswers({});
    setSubmitting(false);
  }, [qSig]);

  useEffect(() => {
    if (!busy) {
      setSubmitting(false);
    }
  }, [busy]);

  const disabled = busy || submitting;
  const canSubmit = useMemo(() => {
    if (!questions?.length) return false;
    const answered = questions.filter((q) => (answers[q.id] ?? "").toString().trim().length > 0).length;
    return answered > 0;
  }, [questions, answers]);

  const doSubmit = useCallback(async () => {
    if (!canSubmit || busy || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (err) {
      console.error("[ClarifyingForm] submit failed", err);
      setSubmitting(false);
    }
  }, [answers, canSubmit, onSubmit, busy, submitting]);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); void doSubmit(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA") {
            e.preventDefault();
            void doSubmit();
          }
        }
        if (e.key === "Escape" && onCancel) onCancel();
      }}
      aria-busy={busy}
    >
      <div className="space-y-4">
        {questions?.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="text-sm text-neutral-600">{q.text}</div>

            {Array.isArray(q.options) && q.options.length ? (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const active = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => setAnswers((s) => ({ ...s, [q.id]: opt }))}
                      className={[
                        "h-9 rounded px-3 border",
                        active
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-800 border-neutral-300",
                        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                disabled={disabled}
                className="h-10 w-full rounded border border-neutral-300 px-3 disabled:opacity-60"
                placeholder="Type your answer and press Enter..."
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer: either button OR thinking loader */}
      {!(busy || submitting) ? (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || disabled}
            className="h-10 px-4 rounded bg-neutral-900 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit answers
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-10 px-3 rounded border border-neutral-300 text-neutral-700"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 text-neutral-700 select-none">
          <span className="font-medium">TradingBro is thinking</span>
          <span className="inline-flex -mb-[2px]">
            <span className="mx-[2px] animate-bounce [animation-delay:-0.2s]">.</span>
            <span className="mx-[2px] animate-bounce [animation-delay:-0.1s]">.</span>
            <span className="mx-[2px] animate-bounce">.</span>
          </span>
        </div>
      )}
    </form>
  );
}
