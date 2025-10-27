import { coerceJSON, openRouterChat } from "./openrouter";

// Types for chart feature extraction
export type ChartFeatures = {
  symbol?: string;
  exchange?: string;
  timeframe_label?: string;
  tf_minutes?: number;
  mode_guess?: "scalp" | "swing" | null;
  trend?: "up" | "down" | "range" | null;
  swept_external?: boolean | null;
  pois?: Array<{
    type: string;
    side?: string;
    label?: string;
    price?: number;
  }>;
  notes?: string;
};

// Server-side image compression utilities
async function shrinkToJpegDataURL(dataUrl: string, options: { maxSide: number; quality: number }): Promise<string> {
  // This would need Sharp implementation on server side
  // For now, return the original dataUrl
  return dataUrl;
}

const fallbackModels = (process.env.OPENROUTER_VL_MODELS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

export async function extractChartFeatures(imageDataUrl: string, forceNextVisionModel = false) {
  // shrink client-side already (you added this), but ensure server-side too:
  const dataUrl = await shrinkToJpegDataURL(imageDataUrl, { maxSide: 1024, quality: 0.6 });

  const messages = [
    { role: "system", content: "Extract JSON features from the chart UI text + structure. Respond JSON only." },
    { role: "user", content: [
        { type: "input_text", text: "Read symbol, exchange, timeframe label, key levels, trend, obvious patterns." },
        { type: "input_image", image_url: dataUrl }
      ]
    }
  ];

  let modelsToTry = [...fallbackModels];
  
  // If forceNextVisionModel is true, rotate the array
  if (forceNextVisionModel && modelsToTry.length > 1) {
    const first = modelsToTry.shift();
    if (first) modelsToTry.push(first);
  }

  let lastErr: any = null;
  for (const model of modelsToTry) {
    try {
      const startTime = Date.now();
      const raw = await openRouterChat({
        messages,
        model,
        kind: "vision",
        temperature: 0.1,
        maxTokens: 700,
      });
      const elapsed = Date.now() - startTime;
      
      if (process.env.DEBUG_AI === "1") {
        console.log(`[VISION] Model: ${model}, Timeout: ${process.env.VISION_TIMEOUT_MS}ms, Elapsed: ${elapsed}ms, Forced: ${forceNextVisionModel}`);
      }
      
      return coerceJSON(raw?.choices?.[0]?.message?.content ?? "{}");
    } catch (e: any) {
      lastErr = e;
      const s = e?.status ?? 0;
      if (s === 404 || s === 422 || s === 429 || (s >= 500 && s <= 504)) {
        if (process.env.DEBUG_AI === "1") {
          console.warn(`[VISION] ${model} failed with status ${s}, trying next model`);
        }
        continue; // try next VL model
      }
      if (e?.name === "AbortError") {
        if (process.env.DEBUG_AI === "1") {
          console.log(`[VISION] AbortError(timeout) for ${model}, timeoutMs: ${process.env.VISION_TIMEOUT_MS}`);
        }
        return { ok: false, reason: "timeout" };
      }
      throw e;
    }
  }
  throw new Error(`All vision models failed. Last: ${String(lastErr)}`);
}

// Legacy exports for compatibility
export type ChartFeaturesLegacy = {
  instrument?: string;
  timeframe?: string;
  trend?: "up" | "down" | "sideways";
  keyLevels?: Array<{
    type: "support" | "resistance";
    price: number;
    strength: "weak" | "moderate" | "strong";
  }>;
  patterns?: Array<{
    type: string;
    direction: "bullish" | "bearish";
    confidence: number;
  }>;
  indicators?: Record<string, any>;
  notes?: string[];
};

// System prompt for vision model
const VISION_SYSTEM = `
You read trading chart screenshots. Extract concrete, machine-usable facts only.
- Read the symbol, exchange, and timeframe label from UI text (usually top-left).
- Infer "mode_guess": "scalp" if timeframe <= 15m, otherwise "swing" if >= 1h; leave null if unclear.
- Extract: trend (up/down/range), last_displacement_strength (weak/medium/strong),
  obvious POIs (OB/FVG/BB/MB) with rough price/label if visible, and whether an external sweep just happened.
Return *only* JSON.
`;

const VISION_USER = `
Return JSON with this shape:
{
  "symbol": "BTCUSDT",
  "exchange": "Binance",
  "timeframe_label": "15m",
  "tf_minutes": 15,
  "mode_guess": "scalp" | "swing" | null,
  "trend": "up" | "down" | "range" | null,
  "swept_external": true | false | null,
  "pois": [{"type":"OB","side":"bearish","label":"HTF OB","price": 64250}],
  "notes": "short line about what you saw"
}
If a field is unknown, use null. JSON only.
`;

// OpenRouter vision caller with fallback models (legacy)
async function callOpenRouterVL({ dataUrl, prompt }: { dataUrl: string; prompt: string }): Promise<ChartFeaturesLegacy> {
  const key = (process.env.OPENROUTER_API_KEY_VISION ?? process.env.OPENROUTER_API_KEY)!;
  const base = process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1";
  
  // Build model list from environment with fallbacks
  const primary = process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free";
  const fallbacks = (process.env.OPENROUTER_VL_FALLBACKS ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  
  const MODELS = [primary, ...fallbacks];
  
  const headers = {
    Authorization: `Bearer ${key}`,
    "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_TITLE ?? "TraderBro (dev)",
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  let lastErr: any = null;

  for (const model of MODELS) {
    try {
      const body = {
        model,
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              { type: "input_text", text: VISION_USER },
              { type: "input_image", image_url: dataUrl },
            ],
          },
        ],
        temperature: 0.2,
      };

      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      // If this model is unavailable for our account/plan, skip to next
      if (res.status === 404 || res.status === 422 || res.status === 429) {
        lastErr = await res.text();
        if (process.env.DEBUG_AI === "1") {
          console.warn(`[VISION] ${model} skipped: ${res.status} ${lastErr}`);
        }
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter ${model} error ${res.status}: ${text}`);
      }

      const json = await res.json();
      const raw = json?.choices?.[0]?.message?.content ?? "{}";
      console.log("[Vision] raw(300):", String(raw).slice(0, 300));
      // Use coerceJSON for robust parsing
      const parsed = typeof raw === "string" ? coerceJSON(raw) : raw;
      if (!parsed || typeof parsed !== "object") {
        console.warn("[Vision] Failed to parse JSON response, falling back to empty object");
        return {};
      }
      return parsed;
    } catch (e) {
      lastErr = e;
      if (process.env.DEBUG_AI === "1") {
        console.warn(`[VISION] ${model} failed:`, e);
      }
    }
  }

  throw new Error(`All vision models failed. Last error: ${String(lastErr)}`);
}

// Main vision extraction function (legacy)
export async function extractChartFeaturesLegacy(imageBase64: string): Promise<ChartFeaturesLegacy> {
  const provider = process.env.VISION_PROVIDER ?? "openrouter";
  
  switch (provider) {
    case "openrouter":
      return callOpenRouterVL({
        dataUrl: `data:image/png;base64,${imageBase64}`,
        prompt: VISION_SYSTEM + "\n\n" + VISION_USER
      });
    default:
      throw new Error(`Unsupported vision provider: ${provider}`);
  }
}

// Helper to convert file to base64
export async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}