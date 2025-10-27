import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
  const key  = process.env.DEEPSEEK_API_KEY || "";
  try {
    const r = await fetch(`${base}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    const j = await r.json();
    return NextResponse.json({ ok: r.ok, status: r.status, models: j?.data ?? j });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 });
  }
}