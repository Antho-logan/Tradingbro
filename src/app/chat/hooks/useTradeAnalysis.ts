"use client";

import { useCallback, useMemo, useState } from "react";
import type { TradePlan } from "@/types/trade";
import { TradeChatResponse } from "@/types/api";
import { shrinkImage } from "@/lib/image-utils";

type Status = "idle" | "analyzing" | "needsAnswers" | "refining" | "done" | "error";

export function useTradeAnalysis() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<TradePlan | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  const analyze = useCallback(async (file: File, meta?: { instrument?: string; timeframe?: string; note?: string }) => {
    setStatus("analyzing");
    setError(null);
    setPlan(null);
    setQuestions([]);
    setDebug(null);

    // Shrink image before upload to reduce token usage and improve VL reliability
    const shrunkFile = await shrinkImage(file, 1200, 0.8);

    const fd = new FormData();
    fd.append("image", shrunkFile);
    if (meta?.instrument) fd.append("instrument", meta.instrument);
    if (meta?.timeframe) fd.append("timeframe", meta.timeframe);
    if (meta?.note) fd.append("note", meta.note);

    const res = await fetch("/api/trade-chat/init", { method: "POST", body: fd });
    const json = await res.json() as TradeChatResponse;
    
    if (!res.ok || json.status === "error") {
      setStatus("error");
      setError(json.status === "error" ? json.error : "Unknown error");
      setDebug(json.debug);
      return;
    }

    setDebug(json.debug);
    
    if (json.status === "questions") {
      setQuestions(json.questions);
      setStatus("needsAnswers");
    } else if (json.status === "plan") {
      setPlan(json.plan);
      setStatus("done");
    }
  }, []);

  const refine = useCallback(async (answers: Record<string, string>) => {
    if (!plan) return;
    setStatus("refining");
    setError(null);
    setDebug(null);

    const res = await fetch("/api/trade-chat/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previous: plan, answers })
    });

    const json = await res.json() as TradeChatResponse;
    
    if (!res.ok || json.status === "error") {
      setStatus("error");
      setError(json.status === "error" ? json.error : "Unknown error");
      setDebug(json.debug);
      return;
    }

    setDebug(json.debug);
    
    // After refine: same logic as init
    if (json.status === "questions" && json.questions?.length > 0) {
      setQuestions(json.questions);
      setStatus("needsAnswers");
    } else if (json.status === "plan" && json.plan) {
      setPlan(json.plan);
      setStatus("done");
    } else {
      setStatus("error");
      setError("Invalid response from server");
    }
  }, [plan]);

  const reset = useCallback(() => {
    setStatus("idle");
    setPlan(null);
    setQuestions([]);
    setError(null);
    setDebug(null);
  }, []);

  return useMemo(() => ({
    status,
    plan,
    questions,
    error,
    debug,
    analyze,
    refine,
    reset
  }), [status, plan, questions, error, debug, analyze, refine, reset]);
}