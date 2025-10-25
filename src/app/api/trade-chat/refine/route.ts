import { NextRequest, NextResponse } from "next/server";
import { callPlannerJSON } from "@/lib/deepseek";
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
    const body = await req.json();
    const previous: TradePlan = body?.previous;
    let answers: Record<string, string> = body?.answers ?? {};

    // coerce repair-style fields if present
    const a = { ...answers };
    if (a.risk) a.risk_pct = a.risk;
    if (a.tf && !a.timeframe) a.timeframe = a.tf;
    if (a.symbol && !a.instrument) a.instrument = a.symbol;
    
    // normalize
    if (a.risk_pct) a.risk_pct = String(a.risk_pct).replace("%","").trim();
    if (a.timeframe) a.timeframe = String(a.timeframe).toUpperCase();
    if (a.instrument) a.instrument = String(a.instrument).replace("/","").toUpperCase();
    
    answers = a;

    if (!previous) {
      return NextResponse.json({
        status: "error",
        error: "Missing previous",
        debug
      } as TradeChatResponse, { status: 400 });
    }

    // Derive TRUTHS from previous.meta or previous.features
    const tf = (previous?.meta?.timeframe || (previous as any).features?.timeframe || "").toUpperCase();
    const instrument = (previous?.meta?.instrument || (previous as any).features?.instrument || "").toUpperCase();

    function tfToMinutes(tf: string) {
      const m = tf.match(/^(\d+)([MHWD])$/i);
      if (!m) return null;
      const n = parseInt(m[1],10);
      const u = m[2].toUpperCase();
      return u === "M" ? n : u === "H" ? n*60 : u === "D" ? n*1440 : u === "W" ? n*10080 : null;
    }
    const minutes = tfToMinutes(tf) ?? 60;
    const mode = minutes <= 15 ? "scalp" : "swing";

    debug.answers = answers;
    debug.hasPreviousPlan = !!previous;

    const plannerMessages = [
      { role: "system", content: buildTradeSystemPrompt({ instrument, timeframe: tf, mode }) },
      { role: "user", content: JSON.stringify({ 
        truths: { instrument, timeframe: tf, mode }, 
        previous, 
        answers 
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
          text: "Could you provide more specific details about your risk tolerance or entry criteria?"
        }],
        debug
      } as TradeChatResponse);
    }
  } catch (err: any) {
    console.error("trade-chat:refine failed", err?.message, err?.stack);
    debug.error = err?.message;
    debug.rawOutput = err?.message?.slice(0, 180);
    
    return NextResponse.json({
      status: "questions",
      questions: [{
        id: 'freeform',
        text: 'I failed to parse; please try answering again with plain numbers/words.'
      }],
      suggestions: [],
      debug
    } as TradeChatResponse, { status: 200 });
  }
}