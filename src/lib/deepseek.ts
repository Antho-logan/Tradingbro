// minimal client for DeepSeek direct with JSON-only responses
import { tradePlanSchema } from "@/types/trade-io"; // your Zod schema
import { coerceJSON, extractFirstJsonObject, textify } from "./safe-json";

// Model alias mapping for DeepSeek compatibility
const MODEL_ALIASES: Record<string, string> = {
  "deepseek-v3.2-exp": "deepseek-reasoner",
  "deepseek-v3.2": "deepseek-reasoner",
  "deepseek-v3.1": "deepseek-v3",
  "deepseek-v3-exp": "deepseek-v3",
  "deepseek-r1": "deepseek-reasoner",
  "deepseek/reasoner": "deepseek-reasoner",
  "deepseek/chat": "deepseek-chat",
};

function normalizeModel(id: string | undefined) {
  if (!id) return "deepseek-chat";
  const k = id.trim().toLowerCase();
  return MODEL_ALIASES[k] ?? id; // pass through if already valid
}


import { ENV } from "@/lib/env";

const DS_BASE = ENV.DEEPSEEK_API_BASE;
const DS_MODEL = ENV.DEEPSEEK_MODEL;
const DS_KEY = ENV.DEEPSEEK_API_KEY!;
const PLANNER_TIMEOUT_MS = ENV.PLANNER_TIMEOUT_MS;

function ensureJsonDirective(messages: Array<{ role: string; content: string }>) {
  const hasJsonWord = messages.some((m) => /json/i.test(m.content));
  if (!hasJsonWord) {
    messages.unshift({
      role: "system",
      content:
        "You must respond with a JSON object only (no prose, no markdown). " +
        "This line intentionally includes word json to satisfy API.",
    });
  }
  return messages.map((message) => ({
    role: message.role,
    content: textify(message.content),
  }));
}

export async function planTrade(messages: Array<{role: string; content: string}>) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), PLANNER_TIMEOUT_MS);
  try {
    const res = await fetch(`${DS_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DS_MODEL,            // 'deepseek-reasoner' or 'deepseek-chat'
        messages,
        response_format: { type: "json_object" },
        max_tokens: 1400,
        temperature: 0.2,
      }),
      signal: ac.signal,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`DeepSeek ${res.status}: ${txt.slice(0,300)}`);
    }
    const json = await res.json();
    return coerceJSON(json?.choices?.[0]?.message?.content ?? "{}");
  } finally {
    clearTimeout(t);
  }
}

export async function callPlannerJSON(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts?: { max_tokens?: number; traceId?: string },
) {
  const startTime = Date.now();
  const normalizedModel = normalizeModel(DS_MODEL);
  const traceId = opts?.traceId ?? `planner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  // Ensure JSON directive is present
  const safeMessages = ensureJsonDirective([...messages]);
  
  if (process.env.DEBUG_AI === "1") {
    console.log(`[PLANNER] ${traceId} start`, {
      model: normalizedModel,
      timeout: PLANNER_TIMEOUT_MS,
      messageCount: safeMessages.length,
    });
  }

  const body = {
    model: normalizedModel,
    temperature: 0.2,
    max_tokens: opts?.max_tokens || 1400,
    messages: safeMessages,
    response_format: { type: "json_object" },
  };

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), PLANNER_TIMEOUT_MS);

  try {
    const res = await fetch(`${DS_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ac.signal,
    });

    if (!res.ok) {
      // try to extract server error
      let detail = "";
      try {
        const raw = await res.text();
        detail = JSON.parse(raw)?.error?.message || raw;
      } catch {
        detail = await res.text();
      }

      // Auto-retry for JSON directive error
      if (res.status === 400 && /word 'json'/.test(detail) && !/RETRIED_JSON/.test(JSON.stringify(safeMessages))) {
        if (process.env.DEBUG_AI === "1") {
          console.warn(`[PLANNER] JSON directive missing, retrying with forced directive`);
        }
        const retried = ensureJsonDirective([...safeMessages, { role: "system", content: "RETRIED_JSON" }]);
        const r2 = await fetch(`${DS_BASE}/chat/completions`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${DS_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, messages: retried }),
          signal: AbortSignal.timeout(PLANNER_TIMEOUT_MS),
        });
        const raw2 = await r2.text();
        if (!r2.ok) throw new Error(`DeepSeek retry error ${r2.status}: ${raw2}`);
        return parsePlannerJSON(raw2);
      }

      // If model id is wrong or not available, try a fallback once:
      if (res.status === 400 && /model/i.test(detail) && /not/i.test(detail)) {
        const fallback = "deepseek-chat";
        if (process.env.DEBUG_AI === "1") {
          console.warn(`[PLANNER] Model "${normalizedModel}" invalid, retrying with "${fallback}"`);
        }
        const r2 = await fetch(`${DS_BASE}/chat/completions`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${DS_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, model: fallback }),
          signal: AbortSignal.timeout(PLANNER_TIMEOUT_MS),
        });
        const raw2 = await r2.text();
        if (!r2.ok) throw new Error(`DeepSeek fallback error ${r2.status}: ${raw2}`);
        return parsePlannerJSON(raw2);
      }

      throw new Error(`DeepSeek planner error ${res.status}: ${detail}`);
    }

    const raw = await res.text();
    const elapsed = Date.now() - startTime;
    
    if (process.env.DEBUG_AI === "1") {
      console.log(`[PLANNER] ${traceId} end`, { elapsed, ok: true, snippet: raw.slice(0, 200) });
    }
    
    return parsePlannerJSON(raw);
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      if (process.env.DEBUG_AI === "1") {
        console.log(`[PLANNER] ${traceId} timeout`, { timeoutMs: PLANNER_TIMEOUT_MS });
      }
      throw new Error(`Planner timed out after ${PLANNER_TIMEOUT_MS}ms`);
    }
    if (process.env.DEBUG_AI === "1") {
      console.log(`[PLANNER] ${traceId} error`, e);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// helper used above (place near bottom)
function parsePlannerJSON(raw: string) {
  if (process.env.DEBUG_AI === "1") console.log("[PLANNER RAW]", raw);
  let content = "";
  try {
    content = JSON.parse(raw)?.choices?.[0]?.message?.content ?? "";
  } catch {
    content = "";
  }
  const parsed = coerceJSON(content) || extractFirstJsonObject(raw) || {};
  if (process.env.DEBUG_AI === "1") console.log("[PLANNER PARSED]", parsed);
  const safe = tradePlanSchema.safeParse(parsed);
  if (!safe.success) {
    if (process.env.DEBUG_AI === "1") console.warn("[PLANNER ZOD ERR]", safe.error.flatten());
    return {
      meta: { mode: "unknown", confidence: 0.2 },
      questions: [{ id:"repair", text:"I need risk %, instrument, and timeframe (e.g., 1, BTCUSDT, 15m)." }],
      suggestions: [],
      warnings: ["Schema validation failed; asked for minimal clarifiers."],
    };
  }
  return safe.data;
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}

// Simple ping function for health checks - returns raw response
export async function pingPlanner() {
  const startTime = Date.now();
  const normalizedModel = normalizeModel(DS_MODEL);
  
  if (process.env.DEBUG_AI === "1") {
    console.log(`[PLANNER PING] Model: ${normalizedModel}, Timeout: ${PLANNER_TIMEOUT_MS}ms`);
  }

  const body = {
    model: normalizedModel,
    temperature: 0.1,
    max_tokens: 50,
    messages: [
      { role: "system", content: "Return a single JSON object only. You are a helpful assistant designed to output JSON. Reply with JSON object ONLY." },
      { role: "user", content: 'Respond with {"ping":"planner_ok"} only.' }
    ],
    response_format: { type: "json_object" },
  };

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), PLANNER_TIMEOUT_MS);

  try {
    const res = await fetch(`${DS_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ac.signal,
    });

    if (!res.ok) {
      let detail = "";
      try {
        const raw = await res.text();
        detail = JSON.parse(raw)?.error?.message || raw;
      } catch {
        detail = await res.text();
      }
      throw new Error(`DeepSeek planner error ${res.status}: ${detail}`);
    }

    const raw = await res.text();
    const elapsed = Date.now() - startTime;
    
    if (process.env.DEBUG_AI === "1") {
      console.log(`[PLANNER PING] Success, elapsed: ${elapsed}ms`);
      console.log("[PLANNER PING RAW]", raw);
    }
    
    // Parse the raw response to get the content
    let content = "";
    let reasoningContent = "";
    try {
      const responseJson = JSON.parse(raw);
      content = responseJson?.choices?.[0]?.message?.content ?? "";
      reasoningContent = responseJson?.choices?.[0]?.message?.reasoning_content ?? "";
      
      // For reasoning models, check reasoning_content if content is empty
      if (!content && reasoningContent) {
        content = reasoningContent;
      }
      
      // Also try to extract JSON from reasoning_content even if content exists
      if (reasoningContent) {
        const reasoningJson = extractFirstJsonObject(reasoningContent);
        if (reasoningJson && Object.keys(reasoningJson).length > 0) {
          content = JSON.stringify(reasoningJson);
        }
      }
    } catch {
      content = "";
    }
    
    // Extract JSON from content
    let parsed = coerceJSON(content);
    if (!parsed) {
      try {
        parsed = extractFirstJsonObject(content);
      } catch {
        parsed = null;
      }
    }
    
    if (process.env.DEBUG_AI === "1") {
      console.log("[PLANNER PING PARSED]", parsed);
    }
    
    return parsed;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      if (process.env.DEBUG_AI === "1") {
        console.log(`[PLANNER PING] AbortError(timeout), timeoutMs: ${PLANNER_TIMEOUT_MS}`);
      }
      throw new Error(`Planner ping timed out after ${PLANNER_TIMEOUT_MS}ms`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}
