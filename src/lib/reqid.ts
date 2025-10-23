export function reqId() {
  // not cryptographically strong, but good enough for tracing
  return "req_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}