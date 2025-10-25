import { NextResponse } from "next/server";
import { callPlannerJSON } from "@/lib/deepseek";
import { coerceJSON } from "@/lib/openrouter";
import { reqId } from "@/lib/reqid";

export async function GET() {
  const id = reqId();
  const out: any = { ok: true, reqId: id, vision: {}, planner: {} };

  // Vision probe (OpenRouter - text only for health check)
  try {
    const key = process.env.OPENROUTER_API_KEY_VISION ?? process.env.OPENROUTER_API_KEY!;
    const base = process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1";
    const vlModel = process.env.VISION_MODEL ?? process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free";
    
    const headers = {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_TITLE ?? "TraderBro (dev)",
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const body = {
      model: vlModel,
      messages: [
        { role: "system", content: "Return a single JSON object only." },
        { role: "user", content: "Respond with {\"ping\":\"vision_ok\"} only." }
      ],
      temperature: 0.1,
    };

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    out.vision.raw = content;
    try {
      out.vision.json = JSON.parse(content.replace(/```json|```/g, ""));
      out.vision.ok = out.vision.json?.ping === "vision_ok";
    } catch {
      out.vision.json = null;
      out.vision.ok = false;
    }
  } catch (e: any) {
    out.ok = false;
    out.vision.error = String(e?.message ?? e);
    out.vision.ok = false;
  }

  // Planner probe (DeepSeek direct)
  try {
    const content = await callPlannerJSON([{
      role: "system", 
      content: "Return a single JSON object only." 
    }, {
      role: "user", 
      content: "Respond with {\"ping\":\"planner_ok\"} only." 
    }], {
      max_tokens: 100
    });
    out.planner.raw = content;
    try {
      // Handle both string and object responses
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      out.planner.json = JSON.parse(contentStr.replace(/```json|```/g, ""));
      out.planner.ok = out.planner.json?.ping === "planner_ok";
    } catch {
      out.planner.json = null;
      out.planner.ok = false;
    }
  } catch (e: any) {
    out.ok = false;
    out.planner.error = String(e?.message ?? e);
    out.planner.ok = false;
  }
  
  out.ok = out.vision.ok && out.planner.ok;

  return NextResponse.json(out);
}