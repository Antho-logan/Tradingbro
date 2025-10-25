import { ENV } from "@/lib/env";
import type { TradePlan } from "@/types/trade";
import { TRADE_SYSTEM_PROMPT } from "@/prompts/trade-system";
import { coerceJSON } from "@/lib/openrouter";
import { tradePlanSchema, TradePlanIO } from "@/types/trade-io";

function stripCodeFences(s: string) {
  return s.replace(/```json\s*([\s\S]*?)```/gi, "$1").replace(/```\s*([\s\S]*?)```/gi, "$1");
}

function extractFirstJsonObject<T = unknown>(raw: string): T {
  // robustly find the first top-level {...} block
  const s = stripCodeFences(raw);
  const start = s.indexOf("{");
  if (start < 0) throw new Error("No '{' found in model output.");
  let level = 0;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") level++;
    else if (ch === "}") {
      level--;
      if (level === 0) {
        const candidate = s.slice(start, i + 1);
        return JSON.parse(candidate) as T;
      }
    }
  }
  throw new Error("Could not find a balanced JSON object in model output.");
}

export async function callDeepSeekVisionToJSON(opts: { userPrompt: string }): Promise<TradePlan> {
  const provider = ENV.DEEPSEEK_PROVIDER;
  let url = ENV.DEEPSEEK_API_BASE;
  let headers: Record<string,string> = { "Content-Type": "application/json" };
  let model = ENV.DEEPSEEK_MODEL;
  let body: any;

  if (provider === "openrouter") {
    // Use OpenRouter with DeepSeek R1 (reasoning) model
    const key = (ENV.OPENROUTER_API_KEY_REASONING ?? ENV.OPENROUTER_API_KEY);
    if (!key) throw new Error("Missing OpenRouter key for reasoning (OPENROUTER_API_KEY_REASONING or OPENROUTER_API_KEY).");
    url = `${ENV.OPENROUTER_BASE}/chat/completions`;
    headers.Authorization = `Bearer ${key}`;
    headers["HTTP-Referer"] = headers["HTTP-Referer"] ?? "http://localhost:3000";
    headers["X-Title"] = headers["X-Title"] ?? "TraderBro - Plan Generator";
    model = ENV.DEEPSEEK_OR_MODEL; // e.g., deepseek/deepseek-r1
    body = {
      model,
      max_tokens: 1200,
      // Keep response_format if model supports it; otherwise rely on coerceJSON
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRADE_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${opts.userPrompt}\n\n` +
            `Return ONLY a valid JSON object that conforms to the schema. ` +
            `Do not add any explanation or markdown fences. No prose.`
        }
      ],
      temperature: 0.2
    };
  } else {
    // Official DeepSeek API
    const key = ENV.DEEPSEEK_API_KEY;
    if (!key) throw new Error("Missing DEEPSEEK_API_KEY (provider=official).");
    headers.Authorization = `Bearer ${key}`;
    body = {
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRADE_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${opts.userPrompt}\n\n` +
            `Return ONLY a valid JSON object that conforms to the schema. ` +
            `Do not add any explanation or markdown fences. No prose.`
        }
      ],
      temperature: 0.2
    };
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DeepSeek plan call failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  
  if (process.env.DEBUG_AI === "1") {
    console.log("[ai] planner raw(300)→", raw.slice(0, 300));
  }
  
  // First attempt: use coerceJSON for robust parsing
  let parsed = coerceJSON(String(raw));
  
  if (!parsed) {
    // Second attempt: try to extract the first well-formed object
    try {
      parsed = extractFirstJsonObject(String(raw));
    } catch (e2: any) {
      // Third attempt: repair pass
      if (process.env.DEBUG_AI === "1") {
        console.log("[ai] JSON parsing failed, attempting repair pass");
      }
      
      try {
        const repairRes = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...body,
            messages: [
              ...body.messages,
              {
                role: "user",
                content: `The previous output was not valid JSON. Please convert it to valid JSON matching the schema. Original output:\n${raw}`
              }
            ]
          })
        });
        
        if (repairRes.ok) {
          const repairData = await repairRes.json();
          const repairRaw = repairData?.choices?.[0]?.message?.content ?? "{}";
          parsed = coerceJSON(String(repairRaw));
        }
      } catch (repairError: any) {
        if (process.env.DEBUG_AI === "1") {
          console.log("[ai] Repair pass failed:", repairError?.message);
        }
      }
      
      if (!parsed) {
        throw new Error(`DeepSeek returned non-JSON. Raw head: ${String(raw).slice(0, 180)}…`);
      }
    }
  }
  
  // Validate with Zod schema
  const validation = tradePlanSchema.safeParse(parsed);
  if (!validation.success) {
    if (process.env.DEBUG_AI === "1") {
      console.log("[ai] Schema validation failed:", validation.error);
    }
    
    // Return a single clarifying question instead of empty arrays
    return {
      meta: {},
      clarifyingQuestions: [{
        id: "repair",
        text: "I couldn't parse your last answers. Please reply with numeric risk %, instrument and timeframe."
      }],
      suggested: [],
      warnings: []
    } as unknown as TradePlan;
  }
  
  // Convert from new schema to existing TradePlan format
  const validated = validation.data;
  return {
    meta: validated.meta,
    clarifyingQuestions: validated.questions,
    suggested: validated.suggestions.map(s => ({
      name: `${s.side.toUpperCase()} Trade`,
      direction: s.side,
      entryZone: `${s.entry.zone[0]}-${s.entry.zone[1]}`,
      stop: `${s.invalidation.price}`,
      targets: s.targets.map(t => ({ rr: t.rr || 1.0 })),
      rationale: s.entry.rationale ? [s.entry.rationale] : [],
      invalidations: s.invalidation.rationale ? [s.invalidation.rationale] : [],
      expectedRR: s.targets[0]?.rr,
      confidence: validated.meta?.confidence
    })),
    warnings: validated.warnings
  } as unknown as TradePlan;
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}