import { ENV } from "@/lib/env";
import { textify } from "@/lib/safe-json";

const VISION_TIMEOUT_MS = ENV.VISION_TIMEOUT_MS;
const PLANNER_TIMEOUT_MS = ENV.PLANNER_TIMEOUT_MS;

export async function openRouterChat({
  messages, model, kind = "planner", // "vision" | "planner"
  responseFormat, temperature = 0.2, maxTokens = 1200,
}: {
  messages: any[];
  model: string;
  kind?: "vision" | "planner";
  responseFormat?: { type: "json_object" } | undefined;
  temperature?: number;
  maxTokens?: number;
}) {
  const timeout = kind === "vision" ? VISION_TIMEOUT_MS : PLANNER_TIMEOUT_MS;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);

  try {
    const base = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_X_TITLE ?? "TraderBro Dev",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      }),
      signal: ac.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      const err = new Error(`OpenRouter error ${res.status} for ${model}: ${txt.slice(0,300)}`);
      // Caller decides whether to fallback
      (err as any).status = res.status;
      (err as any).body = txt;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function callOpenRouterJSON({
  model,
  messages,
  responseFormat = "json_object",
  temperature = 0.2,
}: {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: any }>;
  responseFormat?: "json_object" | "text";
  temperature?: number;
}) {
  const isProd = process.env.NODE_ENV === "production";
  const allowFree = process.env.ALLOW_FREE_MODELS_IN_PROD === "1";
  if (isProd && !allowFree && /:free\b/i.test(model)) {
    throw new Error(`Blocked free-tier model in production: ${model}. Set ALLOW_FREE_MODELS_IN_PROD=1 to override.`);
  }
  const base = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
  const primaryKey = process.env.OPENROUTER_API_KEY;
  const altKey = process.env.OPENROUTER_API_KEY_ALT;
  if (!primaryKey) throw new Error("Missing OPENROUTER_API_KEY");

  const body: any = { model, messages, temperature };
  if (responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
  function jitter(n: number) { return n * (0.7 + Math.random() * 0.6); } // 70–130%

  async function send(key: string, attempt: number, timeoutMs: number) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_X_TITLE ?? "TraderBro Dev",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(t);
    }
  }

  console.log("[OR] model:", model);
  console.log("[OR] req.head:", JSON.stringify({ model, temperature, hasRF: !!body.response_format }, null, 2));
  let res = await send(primaryKey, 1, PLANNER_TIMEOUT_MS); // Use planner timeout
  // retry/backoff on transient statuses
  const transient = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
  let attempt = 1;
  while (!res.ok && transient.has(res.status) && attempt < 3) {
    attempt++;
    const delay = jitter(600 * attempt * attempt); // 0.6s, 2.4s
    if (process.env.DEBUG_AI === "1") {
      console.warn(`[OR] transient ${res.status}, retrying attempt ${attempt} in ${Math.round(delay)}ms`);
    }
    await sleep(delay);
    res = await send(primaryKey, attempt, PLANNER_TIMEOUT_MS);
  }
  // Fallback to ALT key if auth/rate/blocked or still failing
  if (!res.ok && altKey && [401, 403, 429].includes(res.status)) {
    if (process.env.DEBUG_AI === "1") console.warn("[OR] switching to ALT key");
    res = await send(altKey, 1, PLANNER_TIMEOUT_MS);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log("[OR] status:", res.status, "usage:", data?.usage, "provider:", data?.provider);
  const raw = data.choices?.[0]?.message?.content ?? "";
  console.log("[OR] raw(300):", String(raw).slice(0, 300));
  return raw;
}

// test-visible helper; keep behavior identical to your internal usage
export function coerceJSON(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  const unfenced = textify(s).replace(/```json|```/g, "").trim();
  try { return JSON.parse(unfenced); } catch {}
  const m = unfenced.match(/\{[\s\S]*\}$/);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }
  return null;
}