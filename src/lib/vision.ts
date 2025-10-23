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
Return a structured JSON object with the following schema:
{
  "instrument": "e.g., BTC/USDT",
  "timeframe": "e.g., 15m, 1H, 4H, 1D",
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

// OpenRouter vision caller
async function callOpenRouterVL(imageB64: string): Promise<ChartFeatures> {
  const key = (process.env.OPENROUTER_API_KEY_VISION ?? process.env.OPENROUTER_API_KEY)!;
  const base = process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1";
  const model = process.env.VISION_MODEL ?? process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_X_TITLE ?? "TraderBro – Vision",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      // don't force response_format on VL; some providers reject it
      messages: [{
        role: "user",
        content: [
          { type: "input_text", text: VISION_SYSTEM + "\n\n" + VISION_USER_PREFIX },
          { type: "input_image", image_url: `data:image/png;base64,${imageB64}` }
        ],
      }],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter vision error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  console.log("[Vision] raw(300):", String(raw).slice(0, 300));
  // Use coerceJSON for robust parsing
  const parsed = typeof raw === "string" ? coerceJSON(raw) : raw;
  if (!parsed || typeof parsed !== "object") {
    console.warn("[Vision] Failed to parse JSON response, falling back to empty object");
    return {};
  }
  return parsed;
}

// Main vision extraction function
export async function extractChartFeatures(imageBase64: string): Promise<ChartFeatures> {
  const provider = process.env.VISION_PROVIDER ?? "openrouter";
  
  switch (provider) {
    case "openrouter":
      return callOpenRouterVL(imageBase64);
    default:
      throw new Error(`Unsupported vision provider: ${provider}`);
  }
}

// Helper to convert file to base64
export async function fileToBase64(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString("base64");
}