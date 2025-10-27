// Simple environment validation without zod dependency
interface EnvSchema {
  NODE_ENV: string;
  VISION_PROVIDER: "openrouter" | "google" | "openai" | "none";
  OPENROUTER_API_KEY?: string;
  OPENROUTER_API_KEY_VISION?: string;
  OPENROUTER_API_KEY_REASONING?: string;
  OPENROUTER_BASE: string;
  OPENROUTER_VL_MODEL: string;
  GOOGLE_API_KEY?: string;
  GEMINI_MODEL: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE: string;
  OPENAI_VISION_MODEL: string;
  DEEPSEEK_PROVIDER: "official" | "openrouter" | "deepseek";
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_API_BASE: string;
  DEEPSEEK_MODEL: string;
  DEEPSEEK_OR_MODEL: string;
  VISION_TIMEOUT_MS: number;
  PLANNER_TIMEOUT_MS: number;
}

const schema: EnvSchema = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  // Vision provider switch
  VISION_PROVIDER: (process.env.VISION_PROVIDER as any) ?? "openrouter",

  // OpenRouter (Qwen-VL)
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_API_KEY_VISION: process.env.OPENROUTER_API_KEY_VISION,
  OPENROUTER_API_KEY_REASONING: process.env.OPENROUTER_API_KEY_REASONING,
  OPENROUTER_BASE: process.env.OPENROUTER_BASE ?? "https://openrouter.ai/api/v1",
  OPENROUTER_VL_MODEL: process.env.OPENROUTER_VL_MODEL ?? "qwen/qwen2.5-vl-32b-instruct:free",

  // Google Gemini (optional)
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",

  // OpenAI (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_BASE: process.env.OPENAI_BASE ?? "https://api.openai.com/v1",
  OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",

  // DeepSeek (reasoning)
  DEEPSEEK_PROVIDER: (process.env.DEEPSEEK_PROVIDER as any) ?? "openrouter",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  DEEPSEEK_API_BASE: process.env.DEEPSEEK_API_BASE ?? "https://api.deepseek.com/v1",
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  DEEPSEEK_OR_MODEL: process.env.DEEPSEEK_OR_MODEL ?? "deepseek/deepseek-r1",

  // Timeouts in milliseconds
  VISION_TIMEOUT_MS: parseInt(process.env.VISION_TIMEOUT_MS ?? "60000"),
  PLANNER_TIMEOUT_MS: parseInt(process.env.PLANNER_TIMEOUT_MS ?? "90000"),
};

export const ENV = schema;
export const IS_DEV = ENV.NODE_ENV !== "production";