import { NextRequest, NextResponse } from "next/server";
import { callPlannerJSON, fileToBase64 } from "@/lib/deepseek";
import { extractChartFeatures } from "@/lib/vision";
import { TradePlan } from "@/types/trade";
import { TradeChatResponse } from "@/types/api";
import { ENV } from "@/lib/env";
import { buildTradeSystemPrompt } from "@/prompts/trade-system";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const debug: any = {
    provider: ENV.DEEPSEEK_PROVIDER,
    model: ENV.DEEPSEEK_PROVIDER === "openrouter" ? ENV.DEEPSEEK_OR_MODEL : ENV.DEEPSEEK_MODEL,
    timestamp: new Date().toISOString()
  };

  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    const meta = {
      instrument: String(form.get("instrument") ?? ""),
      timeframe: String(form.get("timeframe") ?? ""),
      note: String(form.get("note") ?? ""),
      risk_pct: null
    };

    if (!file) {
      return NextResponse.json({
        status: "error",
        error: "Missing 'image' file",
        debug
      } as TradeChatResponse, { status: 400 });
    }

    const b64 = await fileToBase64(file);
    
    // First extract chart features using vision model
    const features = await extractChartFeatures(b64);
    debug.visionFeatures = features;
    console.log("[VISION RAW]", JSON.stringify(features).slice(0, 300));
    console.log("[VISION PARSED]", `features: ${Object.keys(features).length}`);
    
    // Compute canonical values and TRUTHS
    const tf = (meta?.timeframe || features?.timeframe || "").toUpperCase();
    const instrument = (meta?.instrument || features?.instrument || "").toUpperCase();

    function tfToMinutes(tf: string) {
      const m = tf.match(/^(\d+)([MHWD])$/i);
      if (!m) return null;
      const n = parseInt(m[1],10);
      const u = m[2].toUpperCase();
      return u === "M" ? n : u === "H" ? n*60 : u === "D" ? n*1440 : u === "W" ? n*10080 : null;
    }
    const minutes = tfToMinutes(tf) ?? 60;
    const mode = minutes <= 15 ? "scalp" : "swing";

    // Build planner messages with TRUTHS
    const plannerMessages = [
      { role: "system", content: buildTradeSystemPrompt({ instrument, timeframe: tf, mode }) },
      { role: "user", content: JSON.stringify({
        truths: { instrument, timeframe: tf, mode, risk_pct: meta?.risk_pct ?? null },
        features,
        note: meta?.note ?? null
      }) },
    ];

    const plan = await callPlannerJSON(plannerMessages, { max_tokens: 1200 });

    debug.rawOutput = JSON.stringify(plan).slice(0, 600);
    console.log("[PLANNER RAW]", JSON.stringify(plan).slice(0, 300));
    console.log("[PLANNER PARSED]", {
      questions: plan.questions?.length ?? 0,
      suggestions: plan.suggestions?.length ?? 0
    });

    // Convert from new schema to existing TradePlan format
    const tradePlan = {
      meta: plan.meta || {},
      clarifyingQuestions: plan.questions || [],
      suggested: plan.suggestions?.map((s: any) => ({
        name: `${s.side.toUpperCase()} Trade`,
        direction: s.side,
        entryZone: `${s.entry.zone[0]}-${s.entry.zone[1]}`,
        stop: `${s.invalidation.price}`,
        targets: s.targets.map((t: any) => ({ rr: t.rr || 1.0 })),
        rationale: s.entry.rationale ? [s.entry.rationale] : [],
        invalidations: s.invalidation.rationale ? [s.invalidation.rationale] : [],
        expectedRR: s.targets?.[0]?.rr,
        confidence: (plan.meta as any)?.confidence
      })) || [],
      warnings: plan.warnings || []
    } as TradePlan;

    // Determine response type based on content
    if (tradePlan.clarifyingQuestions && tradePlan.clarifyingQuestions.length > 0) {
      return NextResponse.json({
        status: "questions",
        questions: tradePlan.clarifyingQuestions,
        debug
      } as TradeChatResponse);
    } else if (tradePlan.suggested && tradePlan.suggested.length > 0) {
      return NextResponse.json({
        status: "plan",
        plan: tradePlan,
        debug
      } as TradeChatResponse);
    } else {
      // Edge case: no questions and no suggestions
      return NextResponse.json({
        status: "questions",
        questions: [{
          id: "fallback",
          text: "Could you provide more context about your trading strategy or timeframe?"
        }],
        debug
      } as TradeChatResponse);
    }
  } catch (err: any) {
    console.error("trade-chat:init failed", err?.message, err?.stack);
    debug.error = err?.message;
    debug.rawOutput = err?.message?.slice(0, 180);
    
    return NextResponse.json({
      status: "error",
      error: err?.message ?? "Unknown error",
      debug
    } as TradeChatResponse, { status: 500 });
  }
}