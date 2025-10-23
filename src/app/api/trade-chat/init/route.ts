import { NextRequest, NextResponse } from "next/server";
import { callDeepSeekVisionToJSON, fileToBase64 } from "@/lib/deepseek";
import { extractChartFeatures } from "@/lib/vision";
import { TradePlan } from "@/types/trade";
import { TradeChatResponse } from "@/types/api";
import { ENV } from "@/lib/env";

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
    const instrument = String(form.get("instrument") ?? "");
    const timeframe = String(form.get("timeframe") ?? "");
    const userNote = String(form.get("note") ?? "");

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
    
    // Then analyze with DeepSeek using both image and extracted features
    const userPrompt = [
      "Analyze this chart using the SMC edge. If confirmations are missing, ask up to 4 clarifyingQuestions.",
      `Chart features: ${JSON.stringify(features)}`,
      instrument && `Instrument: ${instrument}`,
      timeframe && `Timeframe: ${timeframe}`,
      userNote && `Note: ${userNote}`
    ].filter(Boolean).join("\n");

    const plan: TradePlan = await callDeepSeekVisionToJSON({
      userPrompt
    });

    debug.rawOutput = JSON.stringify(plan).slice(0, 600);
    console.log("[PLANNER RAW]", JSON.stringify(plan).slice(0, 300));
    console.log("[PLANNER PARSED]", {
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