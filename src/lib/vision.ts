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

// OpenRouter vision caller with fallback models
async function callOpenRouterVL(imageB64: string): Promise<ChartFeatures> {
  const key = (process.env.OPENROUTER_API_KEY_VISION ?? process.env.OPENROUTER_API_KEY)!;
  const base = process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1";
  
  // Try multiple models in order of preference
  const models = [
    process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free"
  ];
  
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_X_TITLE ?? "TraderBro - Vision",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          // don't force response_format on VL; some providers reject it
          messages: [{
            role: "user",
            content: [
              { type: "text", text: VISION_SYSTEM + "\n\n" + VISION_USER_PREFIX },
              { type: "image_url", image_url: `data:image/png;base64,${imageB64}` }
            ],
          }],
        }),
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        if (i === models.length - 1) {
          throw new Error(`All vision models failed. Last error: OpenRouter vision error ${res.status}: ${txt}`);
        }
        continue; // Try next model
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
    } catch (error: any) {
      if (i === models.length - 1) {
        throw error;
      }
      continue; // Try next model
    }
  }
  
  // Should never reach here, but just in case
  throw new Error("All vision models failed");
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