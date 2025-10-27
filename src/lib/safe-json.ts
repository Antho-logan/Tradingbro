/** Robustly turn *anything* into a string so .replace() never crashes. */
export function textify(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  if (Array.isArray(v)) {
    // Handle content blocks like [{type:'text', text:'...'}, ...]
    return v
      .map((p) =>
        typeof p === "string"
          ? p
          : (typeof p === "object" && p !== null
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any -- handling loose JSON-like structures
                ((p as any).text ?? (p as any).content ?? (p as any).value ?? "")
              : "")
      )
      .join("");
  }
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { /* circular */ }
  }
  return String(v);
}

/** Strip code fences etc. and return the first JSON object we can see. */
export function extractFirstJsonObject(input: unknown): Record<string, unknown> | null {
  const s = textify(input);
  if (!s) return null;

  // Remove ```json ``` fences if present
  const cleaned = s.replace(/```json|```/gi, "");

  // Fast path: straight JSON
  try { return JSON.parse(cleaned); } catch {}

  // Fallback: pull the first {...} blob
  const m = cleaned.match(/\{[\s\S]*\}/m);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }
  return null;
}

/** Try hard to coerce to JSON, otherwise return fallback. */
export function coerceJSON<T extends Record<string, unknown> = Record<string, unknown>>(
  input: unknown,
  fallback: T = {} as T,
): T {
  if (input == null) return fallback;

  // Already parsed
  if (typeof input === "object" && !Array.isArray(input)) return input as T;

  const s = textify(input);
  try { return JSON.parse(s) as T; } catch {}

  const first = extractFirstJsonObject(s);
  if (first && typeof first === "object") return first as T;

  return fallback;
}
