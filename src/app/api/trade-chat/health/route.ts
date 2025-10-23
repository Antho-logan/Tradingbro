import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import { reqId } from "@/lib/reqid";

export async function GET() {
  const id = reqId();
  const out: any = { ok: true, reqId: id, vision: {}, planner: {} };

  // Vision probe (Qwen2.5-VL)
  try {
    const vlModel = process.env.VISION_MODEL ?? process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free";
    const content = await callOpenRouterJSON({
      model: vlModel,
      temperature: 0.1,
      responseFormat: "json_object",
      messages: [
        { role: "system", content: "Return a single JSON object only." },
        { role: "user", content: "Respond with {\"ping\":\"vision_ok\"} only." }
      ],
    });
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

  // Planner probe (DeepSeek/Tongyi)
  try {
    const txtModel = process.env.DEEPSEEK_OR_MODEL ?? "deepseek/deepseek-r1";
    const content = await callOpenRouterJSON({
      model: txtModel,
      temperature: 0.2,
      responseFormat: "json_object",
      messages: [
        { role: "system", content: "Return a single JSON object only." },
        { role: "user", content: "Respond with {\"ping\":\"planner_ok\"} only." }
      ],
    });
    out.planner.raw = content;
    try {
      out.planner.json = JSON.parse(content.replace(/```json|```/g, ""));
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

  return NextResponse.json(out);
}