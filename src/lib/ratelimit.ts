type Key = string;
type Bucket = { tokens: number; resetAt: number };

const buckets = new Map<Key, Bucket>();

export function rateLimit({
  key,
  limit = 20,
  windowMs = 60_000,
  now = Date.now(),
}: {
  key: string;
  limit?: number;
  windowMs?: number;
  now?: number;
}) {
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    const fresh = { tokens: limit - 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: fresh.tokens, resetAt: fresh.resetAt };
  }
  if (b.tokens <= 0) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  b.tokens -= 1;
  return { ok: true, remaining: b.tokens, resetAt: b.resetAt };
}