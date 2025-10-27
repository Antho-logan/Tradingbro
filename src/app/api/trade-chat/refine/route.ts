import { NextRequest, NextResponse } from "next/server";
import { callPlannerJSON } from "@/lib/deepseek";
import { TradePlan } from "@/types/trade";
import { PlannerResponse, PlannerSuccess, PlannerError } from "@/types/api";
import { ENV } from "@/lib/env";
import { buildTradeSystemPrompt } from "@/prompts/trade-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PLANNER_TIMEOUT_MS = ENV.PLANNER_TIMEOUT_MS;

const canonicalResponse = (payload: Omit<PlannerSuccess, 'traceId'>, traceId: string, status = 200) =>
  NextResponse.json(
    { ...payload, traceId },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Trace-Id": traceId,
      },
    },
  );

const errorResponse = (payload: Omit<PlannerError, 'traceId'>, traceId: string, status = 500) =>
  NextResponse.json(
    { ...payload, traceId },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Trace-Id": traceId,
      },
    },
  );

const parseBasics = (input: string) => {
  const text = input ?? "";
  const result: Record<string, string> = {};

  const riskMatch = text.match(/(\d+(?:\.\d+)?)\s*%?/i);
  if (riskMatch) {
    const riskNum = parseFloat(riskMatch[1]);
    if (!Number.isNaN(riskNum) && riskNum > 0 && riskNum <= 100) {
      result.risk_pct = riskNum.toString();
    }
  }

  const tfMatch = text.match(/(\d+)\s*([mhdw])/i);
  if (tfMatch) {
    result.timeframe = `${tfMatch[1]}${tfMatch[2].toUpperCase()}`;
  }

  const symbolMatch = text.match(/([A-Z0-9]{2,12})\s*(USDT|USD)?/i);
  if (symbolMatch) {
    const base = symbolMatch[1].toUpperCase();
    const suffix = (symbolMatch[2] ?? "").toUpperCase();
    result.instrument = suffix ? `${base}${suffix}` : base;
  }

  return result;
};

const normaliseInstrument = (value?: string | null) => {
  if (!value) return undefined;
  return value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
};

const logDebug = (traceId: string, step: string, detail: unknown) => {
  if (process.env.DEBUG_AI === "1") {
    console.log(`[REFINE] ${step} trace=${traceId}`, detail);
  }
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const headerTrace = req.headers.get("x-trace-id") ?? `api_refine_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let traceId = headerTrace;
  
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(
      {
        error: { message: "Invalid JSON payload", code: "parse_json_failed" }
      },
      traceId,
      400,
    );
  }

  const payload = body as { previous: TradePlan; answers: Record<string, unknown>; traceId?: string };
  
  if (typeof payload.traceId === "string") {
    traceId = payload.traceId;
  }

  logDebug(traceId, "START", { keys: Object.keys(payload.answers || {}) });

  if (!payload || typeof payload !== "object") {
    return errorResponse(
      {
        error: { message: "Invalid JSON payload", code: "payload_not_object" }
      },
      traceId,
      400,
    );
  }

  const previous = (payload.previous as TradePlan | null) ?? null;
  const incomingAnswers = payload.answers as Record<string, unknown> | undefined;
  let answers: Record<string, string> = {};

  if (incomingAnswers) {
    for (const [key, value] of Object.entries(incomingAnswers)) {
      if (typeof value === "string") {
        answers[key] = value;
      }
    }
  }

  logDebug(traceId, "accept", { hasPrevious: !!previous, answerKeys: Object.keys(answers) });

  if (!previous) {
    return errorResponse(
      {
        error: { message: "Missing previous plan context", code: "no_previous" }
      },
      traceId,
      400,
    );
  }

  const freeformCombined = Object.values(answers).join(" ");
  const parsed = parseBasics(freeformCombined);

  answers = {
    ...answers,
    ...parsed,
  };

  if (answers.risk && !answers.risk_pct) answers.risk_pct = answers.risk;
  if (answers["risk%"] && !answers.risk_pct) answers.risk_pct = answers["risk%"];
  if (answers.risk_pct) {
    const cleanRisk = answers.risk_pct.replace(/[^0-9.]/g, "");
    const riskNum = parseFloat(cleanRisk);
    answers.risk_pct = !Number.isNaN(riskNum) && riskNum > 0 && riskNum <= 100 ? riskNum.toString() : "1";
  }

  if (answers.tf && !answers.timeframe) answers.timeframe = answers.tf;
  if (answers.timeframe) {
    answers.timeframe = answers.timeframe
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/MINUTES?/gi, "M")
      .replace(/HOURS?/gi, "H")
      .replace(/DAYS?/gi, "D")
      .replace(/WEEKS?/gi, "W");
  }

  if (answers.symbol && !answers.instrument) answers.instrument = answers.symbol;
  answers.instrument = normaliseInstrument(answers.instrument) ?? previous.meta?.instrument ?? "";

  const previousMeta = previous.meta ?? {};
  const previousMetaRecord = previousMeta as Record<string, unknown>;
  const previousInstrument = typeof previousMeta.instrument === "string" ? previousMeta.instrument : undefined;
  const previousTimeframe = typeof previousMeta.timeframe === "string" ? previousMeta.timeframe : undefined;
  const previousRiskPct =
    typeof previousMetaRecord["risk_pct"] === "string" ? (previousMetaRecord["risk_pct"] as string) : undefined;
  type PreviousFeatures = { instrument?: string; timeframe?: string };
  const previousFeatures = (previous as TradePlan & { features?: PreviousFeatures }).features ?? {};
  const mergedHints = {
    instrument: answers.instrument ?? previousInstrument ?? normaliseInstrument(previousFeatures.instrument) ?? null,
    timeframe: answers.timeframe ?? previousTimeframe ?? previousFeatures.timeframe ?? null,
    risk_pct: answers.risk_pct ?? previousRiskPct ?? "1",
  };

  const tf = mergedHints.timeframe?.toUpperCase() ?? "";
  const instrument = mergedHints.instrument?.toUpperCase() ?? "";

  const tfMatch = tf.match(/^(\d+)([MHWD])$/);
  const minutes =
    tfMatch && tfMatch[2]
      ? (() => {
          const value = parseInt(tfMatch[1], 10);
          switch (tfMatch[2]) {
            case "M":
              return value;
            case "H":
              return value * 60;
            case "D":
              return value * 1440;
            case "W":
              return value * 10080;
            default:
              return 60;
          }
        })()
      : 60;
  const mode = minutes <= 15 ? "scalp" : "swing";

  const debug = {
    provider: ENV.DEEPSEEK_PROVIDER,
    model: ENV.DEEPSEEK_PROVIDER === "openrouter" ? ENV.DEEPSEEK_OR_MODEL : ENV.DEEPSEEK_MODEL,
    timestamp: new Date().toISOString(),
    traceId,
  } as Record<string, unknown>;

  try {
    const plannerMessages = [
      {
        role: "system" as const,
        content: buildTradeSystemPrompt({
          instrument,
          timeframe: tf,
          mode,
        }),
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          truths: { instrument, timeframe: tf, mode, risk_pct: mergedHints.risk_pct },
          previous,
          answers,
          hints: mergedHints,
        }),
      },
    ];

    logDebug(traceId, "PLANNER START", { model: debug.model, timeout: PLANNER_TIMEOUT_MS });

    const plannerStart = Date.now();
    const plan = await callPlannerJSON(plannerMessages, { max_tokens: 1200, traceId });
    const plannerElapsed = Date.now() - plannerStart;

    type PlannerSuggestion = {
      side?: string;
      entry?: { zone?: [number, number] | string; rationale?: string };
      invalidation?: { price?: number; rationale?: string };
      stop?: number | string;
      targets?: Array<{ rr?: number }>;
    };

    const questions = Array.isArray(plan.questions) ? plan.questions : [];
    const suggestions = Array.isArray(plan.suggestions) ? plan.suggestions : [];

    logDebug(traceId, "PLANNER RESPONSE", {
      status: "success",
      ms: plannerElapsed,
      snippet: JSON.stringify(plan).slice(0, 200)
    });

    const tradePlan: TradePlan = {
      meta: plan.meta ?? {},
      clarifyingQuestions: questions,
      suggested: suggestions.map((s) => ({
        name: `${s.side?.toUpperCase?.() ?? "TRADE"} Trade`,
        direction: (s.side === "long" || s.side === "short") ? s.side : "long", // Default to "long" if undefined
        entryZone: Array.isArray(s.entry?.zone) ? `${s.entry.zone[0]}-${s.entry.zone[1]}` : (typeof s.entry?.zone === "string" ? s.entry.zone : ""),
        stop: `${s.invalidation?.price ?? ""}`,
        targets: (s.targets ?? []).map((t) => ({ rr: t.rr ?? 1.0 })),
        rationale: s.entry?.rationale ? [s.entry.rationale] : [],
        invalidations: s.invalidation?.rationale ? [s.invalidation.rationale] : [],
        expectedRR: s.targets?.[0]?.rr,
        confidence: plan.meta?.confidence,
      })),
      warnings: plan.warnings ?? [],
    };

    // Check for empty planner response
    if (!questions.length && !suggestions.length) {
      const duration = Date.now() - startTime;
      logDebug(traceId, "END", { outcome: "error", duration: `${duration}ms` });
      return errorResponse(
        {
          error: {
            message: "Planner returned empty payload",
            code: "planner_empty"
          }
        },
        traceId,
        502,
      );
    }

    const duration = Date.now() - startTime;

    if (questions.length > 0) {
      logDebug(traceId, "END", { outcome: "questions", duration: `${duration}ms` });
      return canonicalResponse(
        {
          meta: {
            instrument,
            timeframe: tf,
            risk_pct: mergedHints.risk_pct,
            mode
          },
          questions,
          suggestions: [],
        },
        traceId,
      );
    }

    if (suggestions.length > 0) {
      logDebug(traceId, "END", { outcome: "plan", duration: `${duration}ms` });
      return canonicalResponse(
        {
          meta: {
            instrument,
            timeframe: tf,
            risk_pct: mergedHints.risk_pct,
            mode
          },
          questions: [],
          suggestions: tradePlan.suggested,
        },
        traceId,
      );
    }

    logDebug(traceId, "END", { outcome: "questions", duration: `${duration}ms` });
    return canonicalResponse(
      {
        meta: {
          instrument,
          timeframe: tf,
          risk_pct: mergedHints.risk_pct,
          mode
        },
        questions: [
          {
            id: "fallback",
            text: "I need a bit more context (risk %, instrument, timeframe) to refine this plan.",
          },
        ],
        suggestions: [],
      },
      traceId,
    );
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error?.constructor?.name?.toLowerCase() || "unknown_error";
    
    logDebug(traceId, "END", {
      outcome: "error",
      duration: `${duration}ms`,
      error: errorMessage
    });

    // Handle specific error types
    if (error instanceof Error && error.name === "AbortError") {
      return errorResponse(
        {
          error: {
            message: `Planner timeout after ${PLANNER_TIMEOUT_MS}ms`,
            code: "timeout"
          }
        },
        traceId,
        504,
      );
    }

    return errorResponse(
      {
        error: {
          message: errorMessage,
          code: errorCode === "timeout" ? "timeout" : "planner_http"
        }
      },
      traceId,
      500,
    );
  }
}
