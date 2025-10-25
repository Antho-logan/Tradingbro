import { coerceJSON } from "./openrouter";

// Types for chart feature extraction
export type ChartFeatures = {
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
You are an expert technical analyst. Analyze the provided trading chart image and extract key features.

Read all chart UI text: infer symbol/pair, exchange, timeframe label (e.g., 1D/4H/15m), and latest candle time if visible. Return these as fields: symbol, exchange, tf_label, latest_ts (ISO if possible). Also return SMC features if you can (sweep/CHoCH/BOS/OB/FVG etc).

Return a structured JSON object with the following schema:
{
  "symbol": "e.g., BTC/USDT",
  "exchange": "e.g., Binance, Bybit",
  "tf_label": "e.g., 15m, 1H, 4H, 1D",
  "latest_ts": "ISO timestamp if visible",
  "trend": "up|down|sideways",
  "keyLevels": [
    {
      "type": "support|resistance",
      "price": number,
      "strength": "weak|moderate|strong"
    }
  ],
  "patterns": [
    {
      "type": "pattern name",
      "direction": "bullish|bearish",
      "confidence": 0-1
    }
  ],
  "indicators": {
    "rsi": number,
    "macd": "bullish|bearish|neutral",
    "volume": "increasing|decreasing|neutral"
  },
  "notes": ["array of important observations"]
}

Focus on price action, support/resistance levels, trend direction, and any visible patterns.
Be precise with price levels if they are visible on the chart.
Return ONLY valid JSON, no additional text.
`;

const VISION_USER_PREFIX = "Analyze this trading chart and extract the key technical features:";

// OpenRouter vision caller with fallback models
async function callOpenRouterVL({ dataUrl, prompt }: { dataUrl: string; prompt: string }): Promise<ChartFeatures> {
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
              { type: "input_text", text: "Analyze this trading chart image and return JSON only." },
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

// Main vision extraction function
export async function extractChartFeatures(imageBase64: string): Promise<ChartFeatures> {
  const provider = process.env.VISION_PROVIDER ?? "openrouter";
  
  switch (provider) {
    case "openrouter":
      return callOpenRouterVL({
        dataUrl: `data:image/png;base64,${imageBase64}`,
        prompt: VISION_SYSTEM + "\n\n" + VISION_USER_PREFIX
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