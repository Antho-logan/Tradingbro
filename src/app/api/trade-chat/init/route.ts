import { NextRequest, NextResponse } from "next/server";
import { callPlannerJSON, fileToBase64 } from "@/lib/deepseek";
import { extractChartFeatures } from "@/lib/vision";
import { TradePlan } from "@/types/trade";
import { PlannerResponse, PlannerSuccess, PlannerError } from "@/types/api";
import { ENV } from "@/lib/env";
import { buildTradeSystemPrompt } from "@/prompts/trade-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

const logDebug = (traceId: string, step: string, detail: unknown) => {
  if (process.env.DEBUG_AI === "1") {
    if (step === "START") {
      console.log(`[INIT START] trace=${traceId} meta=${JSON.stringify(detail)}`);
    } else if (step === "END") {
      const endDetail = detail as { outcome: string; duration: string };
      console.log(`[INIT END] trace=${traceId} outcome=${endDetail.outcome} duration=${endDetail.duration}`);
    } else {
      console.log(`[INIT] ${step} trace=${traceId}`, detail);
    }
  }
};

const tfToMinutes = (tf: string) => {
  const match = tf.match(/^(\d+)([MHWD])$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  switch (match[2].toUpperCase()) {
    case "M":
      return value;
    case "H":
      return value * 60;
    case "D":
      return value * 1440;
    case "W":
      return value * 10080;
    default:
      return null;
  }
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const url = req.nextUrl;
  const skipVision = url.searchParams.get("novision") === "1";
  const headerTrace = req.headers.get("x-trace-id") ?? `api_init_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let traceId = headerTrace;

  try {
    const form = await req.formData();
    const incomingTraceId = form.get("traceId");
    if (typeof incomingTraceId === "string") {
      traceId = incomingTraceId;
    }

    logDebug(traceId, "START", { skipVision });

    const file = form.get("image") as File | null;
    const meta = {
      instrument: String(form.get("instrument") ?? ""),
      timeframe: String(form.get("timeframe") ?? ""),
      note: String(form.get("note") ?? ""),
      risk_pct: String(form.get("risk_pct") ?? ""),
    };

    const forceNextVisionModel = form.get("forceNextVisionModel") === "true";

    logDebug(traceId, "meta", meta);

    let features: Record<string, unknown> = {};
    let visionTimedOut = false;

    if (!skipVision && file) {
      try {
        const b64 = await fileToBase64(file);
        logDebug(traceId, "vision_start", { forceNextVisionModel });
        features = await extractChartFeatures(`data:image/jpeg;base64,${b64}`, forceNextVisionModel);
        logDebug(traceId, "vision_features", Object.keys(features));
      } catch (visionError: unknown) {
        const reason =
          typeof visionError === "object" && visionError !== null
            ? (visionError as { reason?: string; name?: string }).reason ?? (visionError as { name?: string }).name
            : undefined;
        if (reason === "timeout" || reason === "AbortError") {
          visionTimedOut = true;
          logDebug(traceId, "vision_timeout", {});
        } else {
          logDebug(traceId, "vision_error", visionError);
        }
        features = {};
      }
    } else if (!file && !skipVision) {
      return errorResponse(
        {
          error: {
            message: "Missing 'image' file",
            code: "missing_file"
          }
        },
        traceId,
        400,
      );
    }

    type VisionFeatures = {
      symbol?: string;
      timeframe_label?: string;
      mode_guess?: string;
      trend?: string;
      pois?: unknown;
    };
    const featureData = features as VisionFeatures;

    const instrument = (meta.instrument || featureData.symbol || "").toUpperCase();
    const rawTimeframe = (meta.timeframe || featureData.timeframe_label || "").toUpperCase();
    const timeframe = rawTimeframe;

    const minutes = tfToMinutes(timeframe) ?? 60;
    const mode = minutes <= 15 ? "scalp" : "swing";

    const hints = {
      instrument: instrument || null,
      timeframe: timeframe || null,
      risk_pct: meta.risk_pct || "1",
    };

    logDebug(traceId, "hints", hints);

    const plannerMessages = [
      {
        role: "system" as const,
        content: buildTradeSystemPrompt({
          instrument,
          timeframe,
          mode,
        }),
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          truths: { instrument, timeframe, mode, risk_pct: hints.risk_pct, visionTimedOut },
          features,
          note: meta.note || null,
          hints,
        }),
      },
    ];

    logDebug(traceId, "PLANNER START", { model: ENV.DEEPSEEK_MODEL, timeout: ENV.PLANNER_TIMEOUT_MS });

    const started = Date.now();
    const plan = await callPlannerJSON(plannerMessages, { max_tokens: 1200, traceId });
    const elapsed = Date.now() - started;

    logDebug(traceId, "PLANNER RESPONSE", {
      status: "success",
      ms: elapsed,
      snippet: JSON.stringify(plan).slice(0, 200)
    });

    type PlannerSuggestion = {
      side?: string;
      entry?: { zone?: [number, number] | string; rationale?: string };
      invalidation?: { price?: number; rationale?: string };
      stop?: number | string;
      targets?: Array<{ rr?: number }>;
    };

    const suggestions = Array.isArray(plan.suggestions) ? (plan.suggestions as PlannerSuggestion[]) : [];
    const tradePlan: TradePlan = {
      meta: plan.meta ?? {},
      clarifyingQuestions: Array.isArray(plan.questions) ? plan.questions : [],
      suggested: suggestions.map((s) => ({
        name: `${s.side?.toUpperCase?.() ?? "TRADE"} Trade`,
        direction: (s.side === "long" || s.side === "short") ? s.side : "long", // Default to "long" if undefined
        entryZone: Array.isArray(s.entry?.zone) ? `${s.entry.zone[0]}-${s.entry.zone[1]}` : (s.entry?.zone as string | undefined) ?? "",
        stop: `${s.invalidation?.price ?? s.stop ?? ""}`,
        targets: (s.targets ?? []).map((t) => ({ rr: t.rr ?? 1.0 })),
        rationale: s.entry?.rationale ? [s.entry.rationale] : [],
        invalidations: s.invalidation?.rationale ? [s.invalidation.rationale] : [],
        expectedRR: s.targets?.[0]?.rr,
        confidence: plan.meta?.confidence,
      })),
      warnings: Array.isArray(plan.warnings) ? plan.warnings : [],
    };

    const duration = Date.now() - startTime;

    if (tradePlan.clarifyingQuestions?.length) {
      logDebug(traceId, "END", { outcome: "questions", duration: `${duration}ms` });
      return canonicalResponse(
        {
          meta: {
            instrument,
            timeframe,
            risk_pct: hints.risk_pct,
            mode
          },
          questions: tradePlan.clarifyingQuestions,
          suggestions: tradePlan.suggested || [],
        },
        traceId,
      );
    }

    if (tradePlan.suggested?.length) {
      logDebug(traceId, "END", { outcome: "suggestions", duration: `${duration}ms` });
      return canonicalResponse(
        {
          meta: {
            instrument,
            timeframe,
            risk_pct: hints.risk_pct,
            mode
          },
          questions: [],
          suggestions: tradePlan.suggested || [],
        },
        traceId,
      );
    }

    logDebug(traceId, "END", { outcome: "questions", duration: `${duration}ms` });
    return canonicalResponse(
      {
        meta: {
          instrument,
          timeframe,
          risk_pct: hints.risk_pct,
          mode
        },
        questions: [
          {
            id: visionTimedOut ? "vision_timeout" : "fallback",
            text: visionTimedOut
              ? "Vision timed out. Please supply instrument, timeframe, and what you see on the chart."
              : "Could you provide more context about your trading strategy or timeframe?",
          },
        ],
        suggestions: [],
      },
      traceId,
    );
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logDebug(traceId, "END", { outcome: "error", duration: `${duration}ms`, error });
    return errorResponse(
      {
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          code: error?.constructor?.name?.toLowerCase() || "unknown_error"
        }
      },
      traceId,
      500,
    );
  }
}
