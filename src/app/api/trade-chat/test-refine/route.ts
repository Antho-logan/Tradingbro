import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { coerceJSON } from "@/lib/openrouter";
import { callPlannerJSON } from "@/lib/deepseek";
import { buildTradeSystemPrompt } from "@/prompts/trade-system";
import type { TradePlan, ClarifyingQuestion } from "@/types/trade";
import { tradePlanSchema } from "@/types/trade-io";
import { ENV } from "@/lib/env";
import { reqId } from "@/lib/reqid";
import { extractFirstJsonObject, textify } from "@/lib/safe-json";

/**
 * Test endpoint for refine functionality
 * Allows isolated testing of the refine flow without requiring a full init call
 */
export async function POST(req: NextRequest) {
  const traceId = reqId();
  const startTime = Date.now();
  
  console.log(`[TEST REFINE START] trace=${traceId}`);
  
  // Apply rate limiting
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = rateLimit({ key: `test-refine-${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    const errorResponse = {
      traceId,
      error: {
        message: "Rate limit exceeded",
        code: "rate_limit_exceeded"
      }
    };
    
    const response = NextResponse.json(errorResponse, { status: 429 });
    response.headers.set("X-Trace-Id", traceId);
    return response;
  }

  try {
    const body = await req.json();
    const { mockPlan, mockAnswers } = body;

    if (!mockPlan || !mockAnswers) {
      const errorResponse = {
        traceId,
        error: {
          message: "Missing mockPlan or mockAnswers in request body",
          code: "missing_input"
        }
      };
      
      const response = NextResponse.json(errorResponse, { status: 400 });
      response.headers.set("X-Trace-Id", traceId);
      return response;
    }

    console.log(`[TEST REFINE] Processing mock data trace=${traceId} hasPlan=${!!mockPlan} keys=[${Object.keys(mockAnswers).join(",")}]`);

    // Simulate the refine flow
    const systemPrompt = buildTradeSystemPrompt({
      instrument: mockPlan.meta?.instrument || "UNKNOWN",
      timeframe: mockPlan.meta?.timeframe || "",
      mode: "refine",
    });

    const userPrompt = `Based on the previous plan and user answers, generate a refined trade plan.

PREVIOUS PLAN:
${JSON.stringify(mockPlan, null, 2)}

USER ANSWERS:
${JSON.stringify(mockAnswers, null, 2)}

Generate a complete JSON trade plan response.`;

    console.log(`[PLANNER START] trace=${traceId} model=${ENV.DEEPSEEK_MODEL || "deepseek-chat"} timeout=${ENV.PLANNER_TIMEOUT_MS || 90000}`);

    const plannerStart = Date.now();
    const plannerRaw = await callPlannerJSON([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], {
      max_tokens: 4000,
      traceId,
    });

    const plannerDuration = Date.now() - plannerStart;
    console.log(`[PLANNER RESPONSE] trace=${traceId} status=success ms=${plannerDuration} snippet="${JSON.stringify(plannerRaw).slice(0, 200)}"`);

    const plan = tradePlanSchema.parse(plannerRaw);

    // Convert to canonical response format
    const canonicalResponse = {
      traceId,
      meta: {
        instrument: mockPlan.meta?.instrument || "UNKNOWN",
        timeframe: mockPlan.meta?.timeframe || "",
        risk_pct: mockPlan.meta?.risk_pct || "2",
        mode: "refine"
      },
      questions: plan.questions || [],
      suggestions: plan.suggestions || []
    };

    const totalDuration = Date.now() - startTime;
    console.log(`[TEST REFINE END] trace=${traceId} outcome=${canonicalResponse.questions.length > 0 ? "questions" : "plan"} duration=${totalDuration}ms`);

    const response = NextResponse.json(canonicalResponse);
    response.headers.set("X-Trace-Id", traceId);
    return response;

  } catch (error: unknown) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.log(`[TEST REFINE END] trace=${traceId} outcome=error duration=${totalDuration}ms error=${errorMessage}`);
    
    const errorResponse = {
      traceId,
      error: {
        message: errorMessage,
        code: error?.constructor?.name?.toLowerCase() || "unknown_error"
      }
    };
    
    const response = NextResponse.json(errorResponse, { status: 500 });
    response.headers.set("X-Trace-Id", traceId);
    return response;
  }
}

/**
 * GET endpoint for testing connectivity
 */
export async function GET() {
  const traceId = reqId();
  
  console.log(`[TEST REFINE GET] trace=${traceId}`);
  
  return NextResponse.json({
    traceId,
    status: "ok",
    message: "Test refine endpoint is working",
    timestamp: new Date().toISOString(),
    usage: {
      POST: "Test refine functionality with mock data",
      body: {
        mockPlan: "Partial TradePlan object",
        mockAnswers: "Record<string, string> user answers",
      },
      response: {
        type: "Canonical RefineResponse",
        structure: {
          traceId: "string",
          meta: {
            instrument: "string",
            timeframe: "string",
            risk_pct: "string",
            mode: "refine"
          },
          questions: "string[]",
          suggestions: "string[]"
        }
      }
    },
  });
}