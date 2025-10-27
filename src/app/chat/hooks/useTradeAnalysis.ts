"use client";

import { useCallback, useMemo, useState } from "react";
import type { TradePlan } from "@/types/trade";
import { PlannerResponse } from "@/types/api";
import { shrinkImage } from "@/lib/image-utils";

type Status =
  | "idle"
  | "analyzing"
  | "needsAnswers"
  | "refining"
  | "done"
  | "error"
  | "thinking"
  | "reasoning";

const PLANNER_TIMEOUT_MS = 90_000;

export function useTradeAnalysis() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<TradePlan | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; options?: string[] }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<Record<string, unknown> | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [thinkingText, setThinkingText] = useState<string>("");
  const [traceId, setTraceId] = useState<string>("");

  const analyze = useCallback(
    async (
      file: File,
      meta?: { instrument?: string; timeframe?: string; note?: string; risk_pct?: string },
      forceNextVisionModel = false,
    ) => {
      const traceId = `ui_init_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      console.log("[INIT] client start", traceId);

      setStatus("analyzing");
      setCurrentStep("Preparing image...");
      setThinkingText("");
      setError(null);
      setPlan(null);
      setQuestions([]);
      setDebug(null);

      try {
        const shrunkFile = await shrinkImage(file, 1024, 0.6);

        const fd = new FormData();
        fd.append("image", shrunkFile);
        if (meta?.instrument) fd.append("instrument", meta.instrument);
        if (meta?.timeframe) fd.append("timeframe", meta.timeframe);
        if (meta?.note) fd.append("note", meta.note);
        if (meta?.risk_pct) fd.append("risk_pct", meta.risk_pct);
        if (forceNextVisionModel) fd.append("forceNextVisionModel", "true");
        fd.append("traceId", traceId);

        setStatus("reasoning");
        setCurrentStep("Connecting to AI models...");

        const res = await fetch("/api/trade-chat/init", {
          method: "POST",
          headers: { "x-trace-id": traceId },
          body: fd,
        });
        const json = (await res.json()) as PlannerResponse;
        console.log("[INIT] client end", traceId, res.status);

        if (!res.ok) {
          setStatus("error");
          setError(`HTTP ${res.status}${json.traceId ? ` (trace ${json.traceId})` : ''}`);
          return;
        }

        // Handle canonical response structure
        if ("error" in json) {
          setStatus("error");
          setError(`${json.error.message}${json.traceId ? ` (trace ${json.traceId})` : ''}`);
          return;
        }

        // Success case - canonical structure with traceId, meta, questions, suggestions
        setTraceId(json.traceId);
        
        if (json.questions.length > 0) {
          setCurrentStep("Preparing clarifying questions...");
          setQuestions(json.questions);
          // Store meta for refine calls
          setPlan({
            meta: json.meta,
            clarifyingQuestions: json.questions,
            suggested: json.suggestions || [],
            warnings: [],
          } as TradePlan);
          setStatus("needsAnswers");
        } else if (json.suggestions.length > 0) {
          setCurrentStep("Finalizing trade plan...");
          setPlan({
            meta: json.meta,
            clarifyingQuestions: [],
            suggested: json.suggestions,
            warnings: [],
          } as TradePlan);
          setStatus("done");
        }
      } catch (e: unknown) {
        if (e instanceof Error && (e.name === "AbortError" || e.message?.includes("timed out"))) {
          setStatus("error");
          setError("Timed out (VISION/PLANNER). Click Re-run to try again (we'll rotate models).");
        } else {
          setStatus("error");
          setError(e instanceof Error ? e.message : "Analysis failed");
        }
      }
    },
    [],
  );

  const refine = useCallback(
    async (answers: Record<string, string>) => {
      if (!plan) {
        setError("Nothing to refine yet.");
        return;
      }

      const traceId = `ui_refine_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      console.log("[REFINE] client start", traceId, Object.keys(answers));

      setStatus("refining");
      setError(null);
      setCurrentStep("Refining plan with your answers...");
      setThinkingText("TradingBro is thinking...");

      try {
        const res = await fetch("/api/trade-chat/refine", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-trace-id": traceId,
          },
          body: JSON.stringify({ previous: plan, answers, traceId }),
          signal: AbortSignal.timeout(PLANNER_TIMEOUT_MS),
        });
        console.log("[REFINE] client end", traceId, res.status);
        const json = (await res.json()) as PlannerResponse;

        if (!res.ok) {
          setStatus("error");
          setError(`HTTP ${res.status}${json.traceId ? ` (trace ${json.traceId})` : ''}`);
          return;
        }

        // Handle canonical response structure
        if ("error" in json) {
          setStatus("error");
          setError(`${json.error.message}${json.traceId ? ` (trace ${json.traceId})` : ''}`);
          return;
        }

        // Success case - canonical structure with traceId, meta, questions, suggestions
        setTraceId(json.traceId);

        if (json.questions.length > 0) {
          setCurrentStep("Preparing follow-up questions...");
          setQuestions(json.questions);
          // Preserve meta for further refine calls
          setPlan({
            meta: json.meta,
            clarifyingQuestions: json.questions,
            suggested: [],
            warnings: [],
          } as TradePlan);
          setStatus("needsAnswers");
        } else if (json.suggestions.length > 0) {
          setCurrentStep("Finalizing refined trade plan...");
          setPlan({
            meta: json.meta,
            clarifyingQuestions: [],
            suggested: json.suggestions,
            warnings: [],
          } as TradePlan);
          setStatus("done");
        } else {
          setStatus("error");
          setError("Invalid response from server - no questions or suggestions");
        }
      } catch (e: unknown) {
        if (e instanceof Error && (e.name === "AbortError" || e.message?.includes("timed out"))) {
          setStatus("error");
          setError("Timed out (PLANNER). Click Re-run to try again.");
        } else {
          setStatus("error");
          setError(e instanceof Error ? e.message : "Refine error");
        }
      }
    },
    [plan],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setPlan(null);
    setQuestions([]);
    setError(null);
    setDebug(null);
  }, []);

  const getStatusInfo = useCallback(() => {
    switch (status) {
      case "analyzing":
        return { type: "reasoning" as const, step: currentStep, details: "AI is analyzing your chart" };
      case "reasoning":
        return { type: "reasoning" as const, step: currentStep, details: "AI is refining analysis" };
      case "thinking":
        return { type: "thinking" as const, label: currentStep || "Processing" };
      case "refining":
        return { type: "thinking" as const, label: currentStep || "Processing" };
      default:
        return null;
    }
  }, [currentStep, status]);

  const updateThinkingText = useCallback((text: string) => {
    setThinkingText(text);
  }, []);

  return useMemo(
    () => ({
      status,
      plan,
      questions,
      error,
      debug,
      currentStep,
      thinkingText,
      traceId,
      analyze,
      refine,
      reset,
      getStatusInfo,
      updateThinkingText,
      isIdle: status === "idle",
      isAnalyzing: status === "analyzing",
      isRefining: status === "refining",
      isThinking: status === "thinking",
      isReasoning: status === "reasoning",
      isLoading: status === "analyzing" || status === "thinking" || status === "reasoning" || status === "refining",
      isReady: status === "done",
      isError: status === "error",
      needsAnswers: status === "needsAnswers",
    }),
    [
      status,
      plan,
      questions,
      error,
      debug,
      currentStep,
      thinkingText,
      traceId,
      analyze,
      refine,
      reset,
      getStatusInfo,
      updateThinkingText,
    ],
  );
}
