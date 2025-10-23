import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import { rateLimit } from "@/lib/ratelimit";
import { reqId } from "@/lib/reqid";

export async function GET(req: Request) {
  const id = reqId();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "local";
  const rl = rateLimit({ key: `selftest:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", resetAt: rl.resetAt, reqId: id },
      { status: 429 }
    );
  }

  const model = process.env.OPENROUTER_TEXT_MODEL!;
  const payload = {
    instrument: "BTCUSDT",
    timeframe: "1H",
    mode: "scalp",
    features: {
      trend: "up",
      key_levels: [{ type: "swing_high", price: 69250 }, { type: "swing_low", price: 66100 }],
      patterns: ["liquidity_sweep_high"]
    }
  };

  const system =
    "You are an SMC trading planner. Return EXACTLY ONE JSON object matching {meta,questions,suggestions,warnings}. No prose.";
  const user = JSON.stringify(payload);

  try {
    const raw = await callOpenRouterJSON({
      model,
      responseFormat: "json_object",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let json: any;
    try { json = JSON.parse(cleaned); } catch (e) {
      return NextResponse.json({ ok: false, error: "parse_failed", raw: raw.slice(0, 600), reqId: id }, { status: 502 });
    }
    const ok =
      json && Array.isArray(json.suggestions) &&
      (json.suggestions.length > 0 || Array.isArray(json.questions));
    return NextResponse.json({ ok, model, reqId: id, sample: json });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e), reqId: id }, { status: 500 });
  }
}