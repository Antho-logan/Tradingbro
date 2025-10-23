import { NextRequest, NextResponse } from "next/server";
import { callDeepSeekVisionToJSON } from "@/lib/deepseek";
import { TradePlan } from "@/types/trade";
import { TradeChatResponse } from "@/types/api";
import { ENV } from "@/lib/env";
import { z } from "zod";
import { tradePlanSchema } from "@/types/trade-io";

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
    const answers: Record<string, string> = body?.answers ?? {};

    if (!previous) {
      return NextResponse.json({
        status: "error",
        error: "Missing previous",
        debug
      } as TradeChatResponse, { status: 400 });
    }

    // Validate input with Zod
    const validation = tradePlanSchema.safeParse({
      meta: previous.meta || {},
      questions: previous.clarifyingQuestions || [],
      suggestions: previous.suggested || [],
      warnings: previous.warnings || []
    });
    
    if (!validation.success) {
      console.error("[PLANNER] Previous plan validation failed:", validation.error);
      return NextResponse.json({
        status: "error",
        error: "Invalid previous plan format",
        debug: { ...debug, validationError: validation.error }
      } as TradeChatResponse, { status: 400 });
    }

    debug.answers = answers;
    debug.hasPreviousPlan = !!previous;

    const userPrompt = `
Refine the previous trade analysis using these answers.
Only suggest entries if the full confirmation stack is satisfied; otherwise keep asking.

Context:
{
  "context": {
    "meta": ${JSON.stringify(previous.meta || {})},
    "features": ${JSON.stringify((previous as any).features ?? null)}
  },
  "clarifying_answers": ${JSON.stringify(answers)}
}

Return a single JSON object that matches the TradePlan schema. Do not output any prose.
`;

    const plan: TradePlan = await callDeepSeekVisionToJSON({
      userPrompt
      // No image on refine; we're clarifying logic.
    });

    debug.rawOutput = JSON.stringify(plan).slice(0, 600);
    console.log("[PLANNER RAW]", JSON.stringify(plan).slice(0, 300));
    console.log("[PLANNER PARSED]", {
      questions: plan.clarifyingQuestions?.length ?? 0,
      suggestions: plan.suggested?.length ?? 0
    });

    // Validate the response with Zod
    const planValidation = tradePlanSchema.safeParse({
      meta: plan.meta || {},
      questions: plan.clarifyingQuestions || [],
      suggestions: plan.suggested || [],
      warnings: plan.warnings || []
    });
    
    if (!planValidation.success) {
      console.error("[PLANNER] Response validation failed:", planValidation.error);
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

    console.log('[PLANNER PARSED]', {
      questions: plan.clarifyingQuestions?.length ?? 0,
      suggestions: plan.suggested?.length ?? 0
    });

    // Determine response type based on content
    if (plan.clarifyingQuestions && plan.clarifyingQuestions.length > 0) {
      return NextResponse.json({
        status: "questions",
        questions: plan.clarifyingQuestions,
        debug
      } as TradeChatResponse);
    } else if (plan.suggested && plan.suggested.length > 0) {
      return NextResponse.json({
        status: "plan",
        plan,
        suggestions: plan.suggested,
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